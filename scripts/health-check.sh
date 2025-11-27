#!/bin/bash

###############################################################################
# SUPERNova AI Health Check Script
# Version: 1.0.0
# Description: Comprehensive health check for SUPERNova AI deployment
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
TIMEOUT="${TIMEOUT:-30}"
VERBOSE="${VERBOSE:-false}"

# Health status
ALL_CHECKS_PASSED=true

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ALL_CHECKS_PASSED=false
}

verbose_log() {
    if [ "$VERBOSE" = "true" ]; then
        echo "$1"
    fi
}

check_cluster_connectivity() {
    echo ""
    log_info "Checking Kubernetes cluster connectivity..."

    if kubectl cluster-info &> /dev/null; then
        log_success "Cluster connectivity OK"
    else
        log_error "Cannot connect to Kubernetes cluster"
        return 1
    fi
}

check_namespace() {
    echo ""
    log_info "Checking namespace..."

    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_success "Namespace '$NAMESPACE' exists"
    else
        log_error "Namespace '$NAMESPACE' does not exist"
        return 1
    fi
}

check_pods() {
    echo ""
    log_info "Checking pods status..."

    # Application pods
    APP_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=supernova-ai --no-headers 2>/dev/null || true)
    if [ -z "$APP_PODS" ]; then
        log_error "No application pods found"
        return 1
    fi

    TOTAL_PODS=$(echo "$APP_PODS" | wc -l)
    RUNNING_PODS=$(echo "$APP_PODS" | grep -c "Running" || true)
    READY_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=supernova-ai -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l)

    log_info "Application pods: $RUNNING_PODS/$TOTAL_PODS running, $READY_PODS/$TOTAL_PODS ready"

    if [ "$READY_PODS" -lt 1 ]; then
        log_error "No application pods are ready"
        verbose_log "$APP_PODS"
    else
        log_success "Application pods are healthy"
    fi

    # PostgreSQL pod
    POSTGRES_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=postgres --no-headers 2>/dev/null || true)
    if [ -z "$POSTGRES_PODS" ]; then
        log_error "PostgreSQL pod not found"
    else
        POSTGRES_READY=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}')
        if [ "$POSTGRES_READY" = "True" ]; then
            log_success "PostgreSQL pod is healthy"
        else
            log_error "PostgreSQL pod is not ready"
            verbose_log "$POSTGRES_PODS"
        fi
    fi

    # Redis pod
    REDIS_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=redis --no-headers 2>/dev/null || true)
    if [ -z "$REDIS_PODS" ]; then
        log_error "Redis pod not found"
    else
        REDIS_READY=$(kubectl get pods -n "$NAMESPACE" -l app=redis -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}')
        if [ "$REDIS_READY" = "True" ]; then
            log_success "Redis pod is healthy"
        else
            log_error "Redis pod is not ready"
            verbose_log "$REDIS_PODS"
        fi
    fi
}

check_deployments() {
    echo ""
    log_info "Checking deployments..."

    # Application deployment
    if kubectl get deployment supernova-app -n "$NAMESPACE" &> /dev/null; then
        DESIRED=$(kubectl get deployment supernova-app -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
        AVAILABLE=$(kubectl get deployment supernova-app -n "$NAMESPACE" -o jsonpath='{.status.availableReplicas}')

        if [ "$AVAILABLE" = "$DESIRED" ]; then
            log_success "Application deployment: $AVAILABLE/$DESIRED replicas available"
        else
            log_warning "Application deployment: $AVAILABLE/$DESIRED replicas available"
        fi
    else
        log_error "Application deployment not found"
    fi

    # PostgreSQL deployment
    if kubectl get deployment postgres -n "$NAMESPACE" &> /dev/null; then
        POSTGRES_READY=$(kubectl get deployment postgres -n "$NAMESPACE" -o jsonpath='{.status.availableReplicas}')
        if [ "$POSTGRES_READY" = "1" ]; then
            log_success "PostgreSQL deployment is ready"
        else
            log_error "PostgreSQL deployment is not ready"
        fi
    fi

    # Redis deployment
    if kubectl get deployment redis -n "$NAMESPACE" &> /dev/null; then
        REDIS_READY=$(kubectl get deployment redis -n "$NAMESPACE" -o jsonpath='{.status.availableReplicas}')
        if [ "$REDIS_READY" = "1" ]; then
            log_success "Redis deployment is ready"
        else
            log_error "Redis deployment is not ready"
        fi
    fi
}

check_services() {
    echo ""
    log_info "Checking services..."

    SERVICES=("supernova-service" "postgres-service" "redis-service")

    for service in "${SERVICES[@]}"; do
        if kubectl get service "$service" -n "$NAMESPACE" &> /dev/null; then
            ENDPOINTS=$(kubectl get endpoints "$service" -n "$NAMESPACE" -o jsonpath='{.subsets[*].addresses[*].ip}' | wc -w)
            if [ "$ENDPOINTS" -gt 0 ]; then
                log_success "Service '$service' has $ENDPOINTS endpoint(s)"
            else
                log_error "Service '$service' has no endpoints"
            fi
        else
            log_error "Service '$service' not found"
        fi
    done
}

check_ingress() {
    echo ""
    log_info "Checking ingress..."

    if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
        INGRESS_COUNT=$(kubectl get ingress -n "$NAMESPACE" --no-headers | wc -l)
        log_success "Found $INGRESS_COUNT ingress resource(s)"

        if [ "$VERBOSE" = "true" ]; then
            kubectl get ingress -n "$NAMESPACE"
        fi
    else
        log_warning "No ingress resources found"
    fi
}

check_hpa() {
    echo ""
    log_info "Checking Horizontal Pod Autoscaler..."

    if kubectl get hpa -n "$NAMESPACE" &> /dev/null; then
        HPA_STATUS=$(kubectl get hpa -n "$NAMESPACE" --no-headers 2>/dev/null || true)
        if [ -n "$HPA_STATUS" ]; then
            log_success "HPA is configured"
            if [ "$VERBOSE" = "true" ]; then
                kubectl get hpa -n "$NAMESPACE"
            fi
        else
            log_warning "HPA not found"
        fi
    else
        log_warning "HPA not configured"
    fi
}

check_configmaps_secrets() {
    echo ""
    log_info "Checking ConfigMaps and Secrets..."

    # ConfigMap
    if kubectl get configmap supernova-config -n "$NAMESPACE" &> /dev/null; then
        log_success "ConfigMap 'supernova-config' exists"
    else
        log_error "ConfigMap 'supernova-config' not found"
    fi

    # Secrets
    if kubectl get secret supernova-secrets -n "$NAMESPACE" &> /dev/null; then
        log_success "Secret 'supernova-secrets' exists"
    else
        log_error "Secret 'supernova-secrets' not found"
    fi
}

check_pvc() {
    echo ""
    log_info "Checking Persistent Volume Claims..."

    PVCS=$(kubectl get pvc -n "$NAMESPACE" --no-headers 2>/dev/null || true)
    if [ -n "$PVCS" ]; then
        BOUND_PVCS=$(echo "$PVCS" | grep -c "Bound" || true)
        TOTAL_PVCS=$(echo "$PVCS" | wc -l)

        if [ "$BOUND_PVCS" = "$TOTAL_PVCS" ]; then
            log_success "All PVCs are bound ($BOUND_PVCS/$TOTAL_PVCS)"
        else
            log_warning "Some PVCs are not bound ($BOUND_PVCS/$TOTAL_PVCS)"
            if [ "$VERBOSE" = "true" ]; then
                echo "$PVCS"
            fi
        fi
    else
        log_warning "No PVCs found"
    fi
}

check_application_health() {
    echo ""
    log_info "Checking application health endpoints..."

    POD_NAME=$(kubectl get pod -n "$NAMESPACE" -l app=supernova-ai -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)

    if [ -z "$POD_NAME" ]; then
        log_error "No application pod found to test health endpoint"
        return 1
    fi

    # Test /health endpoint
    if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- wget -q -O- http://localhost:3000/health --timeout="$TIMEOUT" &> /dev/null; then
        log_success "Application /health endpoint is responding"
    else
        log_error "Application /health endpoint is not responding"
    fi

    # Test /ready endpoint
    if kubectl exec -n "$NAMESPACE" "$POD_NAME" -- wget -q -O- http://localhost:3000/ready --timeout="$TIMEOUT" &> /dev/null; then
        log_success "Application /ready endpoint is responding"
    else
        log_error "Application /ready endpoint is not responding"
    fi
}

check_database_connectivity() {
    echo ""
    log_info "Checking database connectivity..."

    POSTGRES_POD=$(kubectl get pod -n "$NAMESPACE" -l app=postgres -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)

    if [ -z "$POSTGRES_POD" ]; then
        log_error "PostgreSQL pod not found"
        return 1
    fi

    if kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- pg_isready -U supernova &> /dev/null; then
        log_success "PostgreSQL is ready and accepting connections"
    else
        log_error "PostgreSQL is not accepting connections"
    fi
}

check_redis_connectivity() {
    echo ""
    log_info "Checking Redis connectivity..."

    REDIS_POD=$(kubectl get pod -n "$NAMESPACE" -l app=redis -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)

    if [ -z "$REDIS_POD" ]; then
        log_error "Redis pod not found"
        return 1
    fi

    if kubectl exec -n "$NAMESPACE" "$REDIS_POD" -- redis-cli ping &> /dev/null; then
        log_success "Redis is responding to ping"
    else
        log_error "Redis is not responding"
    fi
}

check_recent_events() {
    echo ""
    log_info "Checking recent events..."

    WARNING_EVENTS=$(kubectl get events -n "$NAMESPACE" --field-selector type=Warning --sort-by='.lastTimestamp' 2>/dev/null | tail -5)

    if [ -n "$WARNING_EVENTS" ]; then
        log_warning "Recent warning events found:"
        if [ "$VERBOSE" = "true" ]; then
            echo "$WARNING_EVENTS"
        fi
    else
        log_success "No recent warning events"
    fi
}

check_pod_restarts() {
    echo ""
    log_info "Checking pod restart counts..."

    HIGH_RESTART_COUNT=5
    PODS_WITH_RESTARTS=$(kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | awk '{print $1, $4}' | while read name restarts; do
        if [ "$restarts" -gt "$HIGH_RESTART_COUNT" ]; then
            echo "$name has $restarts restarts"
        fi
    done)

    if [ -n "$PODS_WITH_RESTARTS" ]; then
        log_warning "Pods with high restart counts:"
        echo "$PODS_WITH_RESTARTS"
    else
        log_success "No pods with excessive restarts"
    fi
}

generate_summary() {
    echo ""
    echo "=========================================="
    echo "Health Check Summary"
    echo "=========================================="
    echo "Namespace: $NAMESPACE"
    echo "Timestamp: $(date)"
    echo ""

    if [ "$ALL_CHECKS_PASSED" = true ]; then
        log_success "All health checks passed!"
        return 0
    else
        log_error "Some health checks failed. Please review the output above."
        return 1
    fi
}

# Main health check flow
main() {
    log_info "Starting comprehensive health check..."
    log_info "Namespace: $NAMESPACE"

    check_cluster_connectivity
    check_namespace
    check_pods
    check_deployments
    check_services
    check_ingress
    check_hpa
    check_configmaps_secrets
    check_pvc
    check_application_health
    check_database_connectivity
    check_redis_connectivity
    check_recent_events
    check_pod_restarts

    generate_summary
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -n, --namespace NAMESPACE  Kubernetes namespace (default: supernova)"
            echo "  -v, --verbose              Enable verbose output"
            echo "  -t, --timeout SECONDS      Timeout for health checks (default: 30)"
            echo "  -h, --help                 Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main
exit $?
