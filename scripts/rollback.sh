#!/bin/bash

###############################################################################
# SUPERNova AI Rollback Script
# Version: 1.0.0
# Description: Rollback SUPERNova AI deployment to previous version
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-supernova}"
DEPLOYMENT="${DEPLOYMENT:-supernova-app}"
REVISION="${REVISION:-}"

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

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

show_rollout_history() {
    log_info "Deployment rollout history:"
    echo ""
    kubectl rollout history deployment/"$DEPLOYMENT" -n "$NAMESPACE"
    echo ""
}

confirm_rollback() {
    if [ -z "$REVISION" ]; then
        log_warning "No revision specified. Will rollback to previous version."
        read -p "Continue? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Rollback cancelled"
            exit 0
        fi
    else
        log_warning "Will rollback to revision: $REVISION"
        read -p "Continue? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Rollback cancelled"
            exit 0
        fi
    fi
}

create_backup() {
    log_info "Creating backup of current state..."

    BACKUP_DIR="/tmp/supernova-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup deployment
    kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/deployment.yaml"

    # Backup configmap
    kubectl get configmap supernova-config -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/configmap.yaml" 2>/dev/null || true

    # Backup current pod logs
    for pod in $(kubectl get pods -n "$NAMESPACE" -l app=supernova-ai -o jsonpath='{.items[*].metadata.name}'); do
        kubectl logs -n "$NAMESPACE" "$pod" > "$BACKUP_DIR/$pod.log" 2>/dev/null || true
    done

    log_success "Backup created at: $BACKUP_DIR"
}

perform_rollback() {
    log_info "Performing rollback..."

    if [ -z "$REVISION" ]; then
        # Rollback to previous version
        kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE"
    else
        # Rollback to specific revision
        kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE" --to-revision="$REVISION"
    fi

    log_info "Waiting for rollback to complete..."
    kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

    log_success "Rollback completed"
}

verify_rollback() {
    log_info "Verifying rollback..."

    # Check pod status
    READY_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=supernova-ai -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l)
    TOTAL_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=supernova-ai --no-headers | wc -l)

    log_info "Ready pods: $READY_PODS/$TOTAL_PODS"

    if [ "$READY_PODS" -lt 1 ]; then
        log_error "Rollback verification failed: No pods are ready"
        return 1
    fi

    # Test health endpoint
    sleep 10
    POD_NAME=$(kubectl get pod -n "$NAMESPACE" -l app=supernova-ai -o jsonpath="{.items[0].metadata.name}")

    if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- wget -q -O- http://localhost:3000/health &> /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        kubectl logs -n "$NAMESPACE" "$POD_NAME" --tail=50
        return 1
    fi

    log_success "Rollback verification successful"
}

show_current_state() {
    echo ""
    echo "=========================================="
    echo "Current Deployment State"
    echo "=========================================="
    echo "Namespace: $NAMESPACE"
    echo "Deployment: $DEPLOYMENT"
    echo ""
    echo "Pods:"
    kubectl get pods -n "$NAMESPACE" -l app=supernova-ai
    echo ""
    echo "Deployment:"
    kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE"
    echo ""
    echo "Recent Events:"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' --field-selector involvedObject.name="$DEPLOYMENT" | tail -10
    echo "=========================================="
    echo ""
}

# Main rollback flow
main() {
    log_info "Starting rollback of SUPERNova AI..."
    log_info "Namespace: $NAMESPACE"
    log_info "Deployment: $DEPLOYMENT"
    echo ""

    check_prerequisites
    show_rollout_history
    confirm_rollback
    create_backup
    perform_rollback

    if verify_rollback; then
        show_current_state
        log_success "Rollback completed successfully!"
    else
        log_error "Rollback verification failed"
        log_error "Please check the pod logs and events"
        exit 1
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--revision)
            REVISION="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -r, --revision REVISION    Rollback to specific revision"
            echo "  -n, --namespace NAMESPACE  Kubernetes namespace (default: supernova)"
            echo "  -h, --help                 Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                          # Rollback to previous version"
            echo "  $0 -r 3                     # Rollback to revision 3"
            echo "  $0 -n supernova-staging     # Rollback in staging namespace"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
