#!/bin/bash

###############################################################################
# SUPERNova AI Deployment Script
# Version: 1.0.0
# Description: Deploy SUPERNova AI to Kubernetes
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
NAMESPACE="${NAMESPACE:-supernova}"
ENVIRONMENT="${ENVIRONMENT:-production}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
TIMEOUT="${TIMEOUT:-300}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi

    # Check helm (optional)
    if ! command -v helm &> /dev/null; then
        log_warning "helm is not installed. Helm deployments will not be available."
    fi

    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

create_namespace() {
    log_info "Creating namespace if not exists..."
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    log_success "Namespace $NAMESPACE ready"
}

deploy_secrets() {
    log_info "Deploying secrets..."

    if kubectl get secret supernova-secrets -n "$NAMESPACE" &> /dev/null; then
        log_warning "Secrets already exist. Skipping creation."
        log_warning "To update secrets, delete them first: kubectl delete secret supernova-secrets -n $NAMESPACE"
    else
        log_info "Secrets not found. Please create them manually:"
        log_info "kubectl create secret generic supernova-secrets --namespace=$NAMESPACE \\"
        log_info "  --from-literal=DB_PASSWORD=your-password \\"
        log_info "  --from-literal=REDIS_PASSWORD=your-password \\"
        log_info "  --from-literal=JWT_SECRET=\$(openssl rand -base64 32) \\"
        log_info "  --from-literal=SESSION_SECRET=\$(openssl rand -base64 32) \\"
        log_info "  --from-literal=API_KEY=\$(openssl rand -hex 32)"

        read -p "Have you created the secrets? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled. Please create secrets first."
            exit 1
        fi
    fi
}

deploy_configmap() {
    log_info "Deploying ConfigMap..."
    kubectl apply -f "$PROJECT_DIR/k8s/configmap.yaml"
    log_success "ConfigMap deployed"
}

deploy_database() {
    log_info "Deploying PostgreSQL..."
    kubectl apply -f "$PROJECT_DIR/k8s/postgres-deployment.yaml"

    log_info "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod \
        -l app=postgres \
        -n "$NAMESPACE" \
        --timeout="${TIMEOUT}s"

    log_success "PostgreSQL deployed and ready"
}

deploy_redis() {
    log_info "Deploying Redis..."
    kubectl apply -f "$PROJECT_DIR/k8s/redis-deployment.yaml"

    log_info "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod \
        -l app=redis \
        -n "$NAMESPACE" \
        --timeout="${TIMEOUT}s"

    log_success "Redis deployed and ready"
}

deploy_application() {
    log_info "Deploying SUPERNova AI application..."

    # Update image tag in deployment
    kubectl set image deployment/supernova-app \
        supernova-app=ghcr.io/debs-daitani/supernova-build:${IMAGE_TAG} \
        -n "$NAMESPACE" 2>/dev/null || \
    kubectl apply -f "$PROJECT_DIR/k8s/app-deployment.yaml"

    log_info "Waiting for application to be ready..."
    kubectl wait --for=condition=ready pod \
        -l app=supernova-ai \
        -n "$NAMESPACE" \
        --timeout="${TIMEOUT}s"

    log_success "Application deployed and ready"
}

deploy_ingress() {
    log_info "Deploying Ingress..."
    kubectl apply -f "$PROJECT_DIR/k8s/ingress.yaml"
    log_success "Ingress deployed"
}

deploy_hpa() {
    log_info "Deploying Horizontal Pod Autoscaler..."
    kubectl apply -f "$PROJECT_DIR/k8s/hpa.yaml"
    log_success "HPA deployed"
}

deploy_monitoring() {
    log_info "Deploying monitoring resources..."
    kubectl apply -f "$PROJECT_DIR/k8s/monitoring.yaml" 2>/dev/null || \
        log_warning "Monitoring resources require Prometheus Operator. Skipping..."
}

run_health_checks() {
    log_info "Running health checks..."

    # Wait for rollout to complete
    kubectl rollout status deployment/supernova-app -n "$NAMESPACE" --timeout="${TIMEOUT}s"

    # Check pod status
    READY_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=supernova-ai -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l)
    TOTAL_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=supernova-ai --no-headers | wc -l)

    log_info "Ready pods: $READY_PODS/$TOTAL_PODS"

    if [ "$READY_PODS" -lt 1 ]; then
        log_error "No pods are ready!"
        exit 1
    fi

    # Test health endpoint
    log_info "Testing health endpoint..."
    POD_NAME=$(kubectl get pod -n "$NAMESPACE" -l app=supernova-ai -o jsonpath="{.items[0].metadata.name}")

    if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- wget -q -O- http://localhost:3000/health &> /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        kubectl logs -n "$NAMESPACE" "$POD_NAME" --tail=50
        exit 1
    fi
}

show_deployment_info() {
    echo ""
    echo "=========================================="
    echo "Deployment Information"
    echo "=========================================="
    echo "Namespace: $NAMESPACE"
    echo "Environment: $ENVIRONMENT"
    echo "Image Tag: $IMAGE_TAG"
    echo ""
    echo "Pods:"
    kubectl get pods -n "$NAMESPACE"
    echo ""
    echo "Services:"
    kubectl get svc -n "$NAMESPACE"
    echo ""
    echo "Ingress:"
    kubectl get ingress -n "$NAMESPACE"
    echo ""
    echo "HPA:"
    kubectl get hpa -n "$NAMESPACE"
    echo "=========================================="
    echo ""

    log_success "Deployment completed successfully!"
    log_info "Access the application at:"
    kubectl get ingress -n "$NAMESPACE" -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null || echo "Configure ingress to access the application"
}

rollback_on_error() {
    log_error "Deployment failed! Rolling back..."
    kubectl rollout undo deployment/supernova-app -n "$NAMESPACE" 2>/dev/null || true
    exit 1
}

# Main deployment flow
main() {
    log_info "Starting deployment of SUPERNova AI..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Namespace: $NAMESPACE"
    log_info "Image Tag: $IMAGE_TAG"
    echo ""

    # Set trap to rollback on error
    trap rollback_on_error ERR

    check_prerequisites
    create_namespace
    deploy_secrets
    deploy_configmap
    deploy_database
    deploy_redis
    deploy_application
    deploy_ingress
    deploy_hpa
    deploy_monitoring
    run_health_checks
    show_deployment_info
}

# Run main function
main "$@"
