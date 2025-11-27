# SUPERNova AI - Phase 1 Infrastructure Setup

## Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/debs-daitani/supernova-build.git
cd supernova-build

# Copy environment template
cp .env.example .env

# Edit .env with your configurations
vim .env

# Start with Docker Compose
docker-compose up -d

# Check health
curl http://localhost:3000/health
```

### Kubernetes Deployment

```bash
# Quick deploy with kubectl
kubectl apply -k k8s/

# Or use the deployment script
./scripts/deploy.sh

# Check status
./scripts/health-check.sh
```

### Helm Deployment

```bash
# Install with Helm
helm install supernova ./helm/supernova \
  --namespace supernova \
  --create-namespace \
  --values helm/supernova/values-production.yaml

# Upgrade
helm upgrade supernova ./helm/supernova

# Rollback
helm rollback supernova
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer / Ingress                │
│                   (TLS Termination)                      │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────┐
│               Application Layer (3+ pods)                │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│   │  App 1  │  │  App 2  │  │  App 3  │                │
│   │ Node.js │  │ Node.js │  │ Node.js │                │
│   └────┬────┘  └────┬────┘  └────┬────┘                │
└────────┼────────────┼────────────┼─────────────────────┘
         │            │            │
    ┌────┴────────────┴────────────┴─────┐
    │                                      │
┌───┴────────────────┐          ┌─────────┴────────────┐
│   PostgreSQL DB    │          │    Redis Cache        │
│   (Persistent)     │          │    (Persistent)       │
└────────────────────┘          └──────────────────────┘
```

## Infrastructure Components

### 1. Container Images

- **Base Image**: `node:18-alpine`
- **Size**: ~150MB (optimized)
- **Registry**: GitHub Container Registry (ghcr.io)
- **Tags**: Semantic versioning + SHA

### 2. Kubernetes Resources

| Resource | Count | Purpose |
|----------|-------|---------|
| Namespace | 1 | Isolation |
| Deployments | 3 | App, PostgreSQL, Redis |
| Services | 3 | Internal networking |
| ConfigMaps | 2 | Configuration |
| Secrets | 1 | Sensitive data |
| PVCs | 2 | Database + cache storage |
| Ingress | 1 | External access |
| HPA | 1 | Auto-scaling |
| NetworkPolicy | 1 | Security |

### 3. Persistent Storage

- **PostgreSQL**: 10Gi SSD
- **Redis**: 5Gi SSD
- **Logs**: EmptyDir (ephemeral)

### 4. Networking

- **Internal**: ClusterIP services
- **External**: Ingress with TLS
- **DNS**: CoreDNS for service discovery
- **Policies**: Network isolation between components

## Configuration Management

### Environment Variables

All configuration is managed through:
1. **ConfigMaps**: Non-sensitive settings
2. **Secrets**: Credentials and keys
3. **Environment Files**: Local development

See `.env.example` for all available options.

### Secrets Required

```bash
# Database
DB_PASSWORD

# Redis
REDIS_PASSWORD

# Application Security
JWT_SECRET
SESSION_SECRET
API_KEY

# External Services (optional)
OPENAI_API_KEY
ANTHROPIC_API_KEY
```

## Deployment Strategies

### 1. Development

```bash
# Local deployment
docker-compose up -d

# Port forwards
- Application: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
```

### 2. Staging

```bash
# Deploy to staging namespace
NAMESPACE=supernova-staging ./scripts/deploy.sh

# Run tests
kubectl run test --rm -i --restart=Never \
  --image=curlimages/curl:latest -- \
  curl -f http://supernova-service/health
```

### 3. Production

```bash
# Production deployment (requires approval)
IMAGE_TAG=v1.0.0 ENVIRONMENT=production ./scripts/deploy.sh

# Monitor deployment
kubectl rollout status deployment/supernova-app -n supernova

# Verify health
./scripts/health-check.sh --namespace supernova
```

## Monitoring & Observability

### Metrics

**Application Metrics**:
- Request rate and latency
- Error rates
- Active sessions
- Database connections

**System Metrics**:
- CPU and memory usage
- Disk I/O
- Network traffic
- Pod restarts

### Dashboards

1. **Application Overview**: Request rates, errors, latency
2. **Infrastructure**: Resource usage, pod status
3. **Database**: Query performance, connections
4. **Business**: User activity, conversation metrics

### Alerts

**Critical**:
- Application down
- Database unreachable
- High error rate (>5%)
- Memory exhaustion

**Warning**:
- High latency (>1s)
- High CPU (>80%)
- Pod restarts
- Low disk space

## Security

### Best Practices Implemented

✅ Non-root containers
✅ Read-only root filesystem (where possible)
✅ Network policies
✅ RBAC permissions
✅ Secret encryption at rest
✅ TLS for ingress
✅ Security scanning in CI/CD
✅ Vulnerability management
✅ SBOM generation

### Security Scanning

```bash
# Scan Docker image
trivy image ghcr.io/debs-daitani/supernova-build:latest

# Scan Kubernetes manifests
kubesec scan k8s/*.yaml

# Scan dependencies
npm audit
```

## Backup & Recovery

### Database Backups

**Automated**:
```bash
# Scheduled via CronJob
kubectl apply -f k8s/backup-cronjob.yaml
```

**Manual**:
```bash
# Create backup
kubectl exec -n supernova deployment/postgres -- \
  pg_dump -U supernova supernova_db > backup.sql

# Restore backup
kubectl exec -i -n supernova deployment/postgres -- \
  psql -U supernova supernova_db < backup.sql
```

### Disaster Recovery

**RTO** (Recovery Time Objective): 4 hours
**RPO** (Recovery Point Objective): 1 hour

**Steps**:
1. Restore database from latest backup
2. Redeploy application from last known good image
3. Verify health and data integrity
4. Switch traffic to recovered environment

## Scaling

### Horizontal Scaling

**Automatic** (HPA):
- Min replicas: 3
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

**Manual**:
```bash
kubectl scale deployment supernova-app --replicas=5 -n supernova
```

### Vertical Scaling

**VPA** (Vertical Pod Autoscaler):
- Automatically adjusts resource requests/limits
- Based on actual usage patterns
- Mode: Auto

## Cost Optimization

### Resource Requests vs Limits

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Cost Estimates (AWS EKS)

| Environment | Monthly Cost |
|-------------|--------------|
| Development | $50-100 |
| Staging | $150-250 |
| Production | $500-1000 |

*Costs include: Compute, Storage, Networking, and Monitoring*

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Response Time (p95) | <100ms | TBD |
| Throughput | 1000 req/s | TBD |
| Availability | 99.9% | TBD |
| Error Rate | <0.1% | TBD |

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load-test.js

# Stress test
k6 run --vus 100 --duration 30s tests/stress-test.js
```

## Troubleshooting

### Quick Diagnostics

```bash
# Check all resources
kubectl get all -n supernova

# View logs
kubectl logs -n supernova -l app=supernova-ai --tail=100 -f

# Describe pod
kubectl describe pod <pod-name> -n supernova

# Execute commands in pod
kubectl exec -it <pod-name> -n supernova -- /bin/sh

# Port forward for local access
kubectl port-forward -n supernova svc/supernova-service 3000:80
```

### Common Issues

See [Troubleshooting Guide](./infrastructure/README.md#troubleshooting)

## Maintenance

### Regular Tasks

**Daily**:
- Check monitoring dashboards
- Review error logs
- Verify backups

**Weekly**:
- Review resource usage
- Check for updates
- Analyze performance metrics

**Monthly**:
- Review and optimize costs
- Test disaster recovery
- Update dependencies
- Security audit

### Updates & Upgrades

**Application**:
```bash
# Update to new version
IMAGE_TAG=v1.1.0 ./scripts/deploy.sh

# Rollback if needed
./scripts/rollback.sh
```

**Database Migrations**:
```bash
# Apply migration
kubectl exec -i -n supernova deployment/postgres -- \
  psql -U supernova supernova_db < migration.sql
```

## CI/CD Pipeline

### Automated Workflows

1. **Pull Request**: Lint, test, security scan
2. **Merge to Main**: Build, push image, deploy to staging
3. **Tag Release**: Deploy to production (with approval)

### Manual Triggers

```bash
# Trigger deployment via GitHub Actions
gh workflow run cd.yaml -f environment=production

# Or use the script
./scripts/deploy.sh
```

## Support

### Documentation

- **Architecture**: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **API Reference**: [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)
- **Database Schema**: [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)
- **Infrastructure**: [infrastructure/README.md](./infrastructure/README.md)

### Getting Help

1. Check documentation
2. Review troubleshooting guide
3. Search existing issues
4. Create new issue with:
   - Environment details
   - Error logs
   - Steps to reproduce

## License

MIT License - See [LICENSE](./LICENSE) file

---

**Version**: 1.0.0
**Last Updated**: 2025-01-18
**Maintained By**: SUPERNova AI Team
