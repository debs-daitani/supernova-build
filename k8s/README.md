# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the SUPERNova AI Memory System.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured to access your cluster
- Ingress controller (nginx, traefik, etc.)
- Storage class for persistent volumes
- (Optional) Helm v3
- (Optional) Prometheus Operator for monitoring
- (Optional) cert-manager for SSL certificates

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

**IMPORTANT**: Update secrets.yaml with your actual credentials before deploying!

```bash
# Generate strong secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
API_KEY=$(openssl rand -hex 32)

# Create secrets
kubectl create secret generic supernova-secrets \
  --namespace=supernova \
  --from-literal=DB_USER=supernova \
  --from-literal=DB_PASSWORD=your-secure-password \
  --from-literal=REDIS_PASSWORD=your-redis-password \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  --from-literal=SESSION_SECRET=$SESSION_SECRET \
  --from-literal=API_KEY=$API_KEY \
  --from-literal=OPENAI_API_KEY=sk-your-key \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-your-key
```

### 3. Deploy with Kustomize

```bash
# Deploy all resources
kubectl apply -k .

# Or deploy individual resources
kubectl apply -f configmap.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f app-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f monitoring.yaml
```

### 4. Verify Deployment

```bash
# Check all resources
kubectl get all -n supernova

# Check pods
kubectl get pods -n supernova

# Check services
kubectl get svc -n supernova

# Check ingress
kubectl get ingress -n supernova

# View logs
kubectl logs -n supernova -l app=supernova-ai --tail=100 -f
```

## Configuration

### ConfigMap

Edit `configmap.yaml` to customize application settings:
- Database connection
- Redis configuration
- Feature flags
- Logging levels
- Performance tuning

### Secrets

Update secrets using:

```bash
kubectl edit secret supernova-secrets -n supernova
```

Or recreate:

```bash
kubectl delete secret supernova-secrets -n supernova
kubectl create secret generic supernova-secrets --from-literal=...
```

### Ingress

Update `ingress.yaml` with your domain:

```yaml
spec:
  rules:
  - host: your-domain.com  # Change this
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: supernova-service
            port:
              number: 80
```

## Scaling

### Manual Scaling

```bash
# Scale application
kubectl scale deployment supernova-app -n supernova --replicas=5

# Scale database (not recommended for stateful apps)
kubectl scale deployment postgres -n supernova --replicas=1
```

### Auto Scaling

The HPA (Horizontal Pod Autoscaler) is configured in `hpa.yaml`:
- Min replicas: 3
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

Monitor auto scaling:

```bash
kubectl get hpa -n supernova
kubectl describe hpa supernova-app-hpa -n supernova
```

## Monitoring

### Prometheus

If using Prometheus Operator:

```bash
# Check ServiceMonitor
kubectl get servicemonitor -n supernova

# Check PrometheusRule
kubectl get prometheusrule -n supernova
```

### Metrics

Access metrics:

```bash
# Port-forward to app
kubectl port-forward -n supernova svc/supernova-service 3000:80

# View metrics
curl http://localhost:3000/metrics
```

### Grafana

Import the dashboard from `monitoring.yaml` ConfigMap.

## Database Management

### Initialize Database

```bash
# Copy init scripts to pod
kubectl cp infrastructure/database/init/01-init-database.sql supernova/postgres-xxxx:/tmp/

# Execute script
kubectl exec -it -n supernova postgres-xxxx -- psql -U supernova -d supernova_db -f /tmp/01-init-database.sql
```

### Backup Database

```bash
# Create backup
kubectl exec -n supernova postgres-xxxx -- pg_dump -U supernova supernova_db > backup.sql

# Restore backup
kubectl exec -i -n supernova postgres-xxxx -- psql -U supernova supernova_db < backup.sql
```

### Database Migrations

```bash
# Run migration
kubectl exec -i -n supernova postgres-xxxx -- psql -U supernova -d supernova_db < migration.sql
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n supernova
kubectl describe pod <pod-name> -n supernova
kubectl logs <pod-name> -n supernova
```

### Check Events

```bash
kubectl get events -n supernova --sort-by='.lastTimestamp'
```

### Common Issues

**Pods not starting:**
```bash
# Check events
kubectl describe pod <pod-name> -n supernova

# Check logs
kubectl logs <pod-name> -n supernova
```

**Database connection issues:**
```bash
# Test database connectivity
kubectl exec -it -n supernova <app-pod> -- nc -zv postgres-service 5432

# Check database logs
kubectl logs -n supernova <postgres-pod>
```

**Redis connection issues:**
```bash
# Test Redis connectivity
kubectl exec -it -n supernova <app-pod> -- nc -zv redis-service 6379

# Check Redis logs
kubectl logs -n supernova <redis-pod>
```

### Debug Mode

Enable debug logging:

```bash
kubectl set env deployment/supernova-app -n supernova LOG_LEVEL=debug
```

## Updates and Rollbacks

### Update Application

```bash
# Update image
kubectl set image deployment/supernova-app -n supernova supernova-app=supernova-ai:v2.0.0

# Watch rollout
kubectl rollout status deployment/supernova-app -n supernova
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/supernova-app -n supernova

# Rollback to previous version
kubectl rollout undo deployment/supernova-app -n supernova

# Rollback to specific revision
kubectl rollout undo deployment/supernova-app -n supernova --to-revision=2
```

## Cleanup

```bash
# Delete all resources
kubectl delete namespace supernova

# Or delete individually
kubectl delete -k .
```

## Production Considerations

1. **High Availability**:
   - Use PostgreSQL operator (Zalando, Crunchy) for HA database
   - Use Redis Sentinel or Redis Cluster for HA cache
   - Deploy across multiple availability zones

2. **Security**:
   - Use network policies
   - Enable pod security policies
   - Use sealed secrets or external secret management
   - Regular security scans

3. **Backup**:
   - Implement automated database backups
   - Use Velero for cluster backups
   - Regular disaster recovery drills

4. **Monitoring**:
   - Set up comprehensive monitoring
   - Configure alerting
   - Log aggregation (ELK, Loki)

5. **Performance**:
   - Use appropriate resource limits
   - Enable HPA
   - Consider VPA for right-sizing
   - Use PodDisruptionBudgets

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kustomize Documentation](https://kustomize.io/)
- [Helm Documentation](https://helm.sh/docs/)
