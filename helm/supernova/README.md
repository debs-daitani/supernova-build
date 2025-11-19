# SUPERNova Helm Chart

## Introduction

This Helm chart deploys the SUPERNova AI Memory System on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.0+
- PV provisioner support in the underlying infrastructure
- (Optional) Ingress controller
- (Optional) cert-manager for TLS certificates
- (Optional) Prometheus Operator for monitoring

## Installation

### Add Helm Repository (if published)

```bash
helm repo add supernova https://debs-daitani.github.io/supernova-build
helm repo update
```

### Install from Source

```bash
# Clone repository
git clone https://github.com/debs-daitani/supernova-build.git
cd supernova-build/helm

# Install chart
helm install supernova ./supernova \
  --namespace supernova \
  --create-namespace
```

### Install with Custom Values

```bash
helm install supernova ./supernova \
  --namespace supernova \
  --create-namespace \
  --values custom-values.yaml
```

### Production Installation

```bash
helm install supernova ./supernova \
  --namespace supernova \
  --create-namespace \
  --values values-production.yaml \
  --set secrets.DB_PASSWORD=your-secure-password \
  --set secrets.REDIS_PASSWORD=your-redis-password \
  --set secrets.JWT_SECRET=$(openssl rand -base64 32) \
  --set secrets.SESSION_SECRET=$(openssl rand -base64 32) \
  --set secrets.API_KEY=$(openssl rand -hex 32)
```

## Configuration

### Key Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app.replicaCount` | Number of app replicas | `3` |
| `app.image.repository` | App image repository | `ghcr.io/debs-daitani/supernova-build` |
| `app.image.tag` | App image tag | `latest` |
| `app.resources.limits.cpu` | CPU limit | `500m` |
| `app.resources.limits.memory` | Memory limit | `512Mi` |
| `app.autoscaling.enabled` | Enable HPA | `true` |
| `app.autoscaling.minReplicas` | Min replicas | `3` |
| `app.autoscaling.maxReplicas` | Max replicas | `10` |
| `postgresql.enabled` | Deploy PostgreSQL | `true` |
| `postgresql.persistence.size` | PostgreSQL PVC size | `10Gi` |
| `redis.enabled` | Deploy Redis | `true` |
| `redis.persistence.size` | Redis PVC size | `5Gi` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class | `nginx` |
| `monitoring.enabled` | Enable monitoring | `true` |

### All Parameters

See [values.yaml](./values.yaml) for all available parameters.

## Upgrading

### Upgrade to New Version

```bash
helm upgrade supernova ./supernova \
  --namespace supernova \
  --reuse-values \
  --set app.image.tag=v1.1.0
```

### Upgrade with New Values

```bash
helm upgrade supernova ./supernova \
  --namespace supernova \
  --values new-values.yaml
```

## Rollback

```bash
# View history
helm history supernova -n supernova

# Rollback to previous version
helm rollback supernova -n supernova

# Rollback to specific revision
helm rollback supernova 2 -n supernova
```

## Uninstallation

```bash
helm uninstall supernova -n supernova

# Delete namespace (caution: deletes all resources)
kubectl delete namespace supernova
```

## Examples

### Development Environment

```bash
helm install supernova ./supernova \
  --namespace supernova-dev \
  --create-namespace \
  --set app.replicaCount=1 \
  --set app.autoscaling.enabled=false \
  --set app.env.NODE_ENV=development \
  --set postgresql.persistence.size=5Gi \
  --set redis.persistence.size=2Gi
```

### Staging Environment

```bash
helm install supernova ./supernova \
  --namespace supernova-staging \
  --create-namespace \
  --values values-staging.yaml \
  --set app.image.tag=staging-latest
```

### Production with External Database

```bash
helm install supernova ./supernova \
  --namespace supernova \
  --create-namespace \
  --values values-production.yaml \
  --set postgresql.enabled=false \
  --set app.env.DB_HOST=external-db.example.com \
  --set app.env.DB_PORT=5432
```

## Secrets Management

### Option 1: Helm Values (Development)

```bash
helm install supernova ./supernova \
  --set secrets.DB_PASSWORD=password123
```

### Option 2: External Secrets (Recommended)

```yaml
# values.yaml
secrets:
  existingSecret: supernova-secrets
```

```bash
# Create secret separately
kubectl create secret generic supernova-secrets \
  --namespace=supernova \
  --from-literal=DB_PASSWORD=secure-password
```

### Option 3: Sealed Secrets

```bash
# Install sealed-secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Create sealed secret
kubeseal -f secret.yaml -w sealed-secret.yaml
```

## Monitoring

### Prometheus ServiceMonitor

```yaml
# values.yaml
monitoring:
  serviceMonitor:
    enabled: true
    interval: 30s
```

### Access Metrics

```bash
# Port forward to application
kubectl port-forward -n supernova svc/supernova 3000:80

# View metrics
curl http://localhost:3000/metrics
```

## Troubleshooting

### Check Release Status

```bash
helm status supernova -n supernova
```

### View Rendered Templates

```bash
helm template supernova ./supernova \
  --namespace supernova \
  --values values-production.yaml > rendered.yaml
```

### Debug Installation

```bash
helm install supernova ./supernova \
  --namespace supernova \
  --debug \
  --dry-run
```

### Common Issues

**Issue**: Pods not starting
```bash
# Check events
kubectl get events -n supernova --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs -n supernova -l app=supernova --tail=100
```

**Issue**: PVC not bound
```bash
# Check PVC status
kubectl get pvc -n supernova

# Describe PVC
kubectl describe pvc -n supernova postgres-pvc
```

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

MIT License - See LICENSE file for details
