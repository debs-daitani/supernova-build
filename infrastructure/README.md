# SUPERNova AI Infrastructure

## Overview

This directory contains all infrastructure-as-code (IaC) configurations for deploying and managing the SUPERNova AI Memory System in production environments.

## Directory Structure

```
infrastructure/
├── database/           # Database initialization and migrations
│   ├── init/          # Initial database schema
│   └── migrations/    # Database migration scripts
├── nginx/             # Nginx reverse proxy configuration
│   ├── nginx.conf    # Main nginx configuration
│   └── conf.d/       # Virtual host configurations
├── prometheus/        # Prometheus monitoring configuration
│   └── prometheus.yml
└── grafana/          # Grafana dashboards and datasources
    ├── dashboards/
    └── datasources/
```

## Components

### 1. Database Infrastructure

#### PostgreSQL

- **Version**: 15 (Alpine)
- **Storage**: Persistent Volume (10Gi)
- **Backup**: Daily automated backups
- **High Availability**: Consider using PostgreSQL Operator for production

**Files**:
- `database/init/01-init-database.sql` - Complete schema initialization
- `database/init/02-seed-data.sql` - Sample/test data
- `database/migrations/` - Versioned schema changes

**Features**:
- Full-text search indexes
- Automatic timestamp triggers
- Materialized views for analytics
- Row-level security ready
- Audit logging

#### Redis

- **Version**: 7 (Alpine)
- **Mode**: Standalone (consider Sentinel/Cluster for HA)
- **Storage**: Persistent (5Gi)
- **Configuration**: LRU eviction, AOF persistence

**Use Cases**:
- Session caching
- User preferences caching
- Rate limiting
- Temporary data storage

### 2. Application Infrastructure

#### Docker

**Multi-stage build**:
1. Builder stage: Install dependencies and compile
2. Production stage: Minimal runtime image

**Security**:
- Non-root user (nodejs:1001)
- Read-only root filesystem
- Security scanning with Trivy
- SBOM generation

**Health Checks**:
- HTTP health endpoint
- 30s interval, 3 retries
- Proper signal handling with dumb-init

#### Kubernetes

**Resources**:
- Namespace isolation
- Resource limits and requests
- Pod Disruption Budgets
- Network Policies
- RBAC permissions

**Scaling**:
- HPA: 3-10 replicas
- VPA: Automatic resource right-sizing
- Anti-affinity for pod distribution

**Monitoring**:
- Prometheus metrics
- Custom alerting rules
- Grafana dashboards
- Service mesh ready

### 3. Networking

#### Ingress

- **Controller**: Nginx Ingress (configurable)
- **TLS**: cert-manager integration
- **Rate Limiting**: 100 req/s per IP
- **Security Headers**: XSS, CSP, HSTS

#### Service Mesh (Optional)

Consider implementing Istio or Linkerd for:
- Mutual TLS
- Advanced traffic management
- Distributed tracing
- Service-to-service authentication

### 4. Monitoring & Observability

#### Prometheus

**Metrics Collection**:
- Application metrics (/metrics endpoint)
- Kubernetes metrics (kube-state-metrics)
- Node metrics (node-exporter)
- Custom business metrics

**Retention**: 30 days (configurable)

#### Grafana

**Dashboards**:
- Application performance
- Database metrics
- Cache hit rates
- Business KPIs

#### Alerting

**Alert Categories**:
- Critical: Database down, high error rate
- Warning: High memory, slow responses
- Info: Deployment events

**Channels**:
- Slack
- PagerDuty
- Email
- Webhook

### 5. Logging

**Stack Options**:

**Option 1: ELK Stack**
- Elasticsearch for storage
- Logstash/Fluentd for aggregation
- Kibana for visualization

**Option 2: Loki Stack**
- Loki for storage (more cost-effective)
- Promtail for collection
- Grafana for visualization

**Log Levels**:
- Production: INFO
- Staging: DEBUG
- Development: VERBOSE

### 6. Security

#### Secrets Management

**Options**:
1. **Kubernetes Secrets** (basic)
2. **Sealed Secrets** (encrypted in Git)
3. **External Secrets Operator** (vault integration)
4. **Cloud Provider Secrets** (AWS/Azure/GCP)

**Rotation**:
- Automated secret rotation
- Zero-downtime updates
- Audit trail

#### Network Security

- **Network Policies**: Restrict pod-to-pod communication
- **TLS**: End-to-end encryption
- **API Authentication**: JWT-based
- **Rate Limiting**: DDoS protection

#### Security Scanning

**Container Images**:
- Trivy vulnerability scanning
- Automated scanning in CI/CD
- Severity thresholds

**Dependencies**:
- Dependabot alerts
- npm audit
- SBOM generation

### 7. Backup & Disaster Recovery

#### Database Backups

**Strategy**:
- Daily full backups
- Hourly incremental backups
- Point-in-time recovery (PITR)
- Cross-region replication

**Tools**:
- pg_dump for PostgreSQL
- Velero for Kubernetes resources
- S3/Cloud Storage for backup storage

**Retention**:
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

#### Application State

**Backup**:
- ConfigMaps and Secrets
- PersistentVolume snapshots
- Application configurations

**Testing**:
- Monthly DR drills
- Automated restore testing
- RTO: 4 hours
- RPO: 1 hour

### 8. CI/CD Pipeline

#### GitHub Actions Workflows

**1. CI Workflow** (`ci.yaml`):
- Lint code
- Run tests
- Security scanning
- Build Docker image
- Validate Kubernetes manifests

**2. CD Workflow** (`cd.yaml`):
- Deploy to development
- Deploy to staging
- Deploy to production (with approval)
- Run smoke tests
- Database migrations

**3. Docker Build** (`docker-build.yaml`):
- Multi-platform builds
- Image signing with Cosign
- SBOM generation
- Push to registry

**4. Cleanup** (`cleanup.yaml`):
- Remove old images
- Clean up artifacts
- Archive old runs

#### Deployment Strategies

**1. Rolling Update** (default):
- Zero-downtime deployments
- Gradual rollout
- Automatic rollback on failure

**2. Blue-Green**:
- Full environment duplication
- Instant cutover
- Easy rollback

**3. Canary**:
- Gradual traffic shift
- A/B testing capable
- Metrics-driven rollout

### 9. Performance Optimization

#### Caching Strategy

**Levels**:
1. Application-level (in-memory)
2. Redis (distributed cache)
3. CDN (static assets)

**TTL Configuration**:
- Sessions: 5 minutes
- User preferences: 5 minutes
- Conversations: 2 minutes

#### Database Optimization

**Indexes**:
- B-tree for exact matches
- GIN for full-text search
- Composite for multi-column queries

**Query Optimization**:
- Connection pooling
- Prepared statements
- Query result caching

#### Resource Tuning

**PostgreSQL**:
```
shared_buffers = 256MB
work_mem = 16MB
maintenance_work_mem = 128MB
max_connections = 100
```

**Redis**:
```
maxmemory = 256mb
maxmemory-policy = allkeys-lru
```

### 10. Cost Optimization

#### Resource Right-Sizing

- Use VPA for automatic sizing
- Monitor actual usage vs requests
- Scale down in non-production

#### Storage Optimization

- Archive old data
- Compress backups
- Use appropriate storage classes

#### Compute Optimization

- Spot/Preemptible instances for non-critical workloads
- Auto-scaling based on demand
- Schedule scaling for known patterns

## Environment-Specific Configurations

### Development

```yaml
Replicas: 1
Resources: Minimal (256Mi/250m)
Persistence: EmptyDir or hostPath
Monitoring: Optional
Logging: Debug level
```

### Staging

```yaml
Replicas: 2
Resources: Medium (512Mi/500m)
Persistence: PVC (small)
Monitoring: Full
Logging: Info level
```

### Production

```yaml
Replicas: 3+ (with HPA)
Resources: Optimal (determined by VPA)
Persistence: PVC (SSD, replicated)
Monitoring: Full with alerting
Logging: Info level with retention
```

## Deployment Checklist

### Pre-Deployment

- [ ] Review and update configurations
- [ ] Generate and store secrets securely
- [ ] Verify resource quotas
- [ ] Test backup/restore procedures
- [ ] Review security policies
- [ ] Update documentation

### Deployment

- [ ] Deploy infrastructure (database, cache)
- [ ] Run database migrations
- [ ] Deploy application
- [ ] Configure ingress
- [ ] Set up monitoring
- [ ] Configure alerting

### Post-Deployment

- [ ] Verify health checks
- [ ] Run smoke tests
- [ ] Check monitoring dashboards
- [ ] Verify logging
- [ ] Test backup systems
- [ ] Document deployment

## Troubleshooting

### Common Issues

1. **Pods not starting**
   - Check resource availability
   - Verify secrets exist
   - Check image pull permissions

2. **Database connection issues**
   - Verify service endpoints
   - Check network policies
   - Verify credentials

3. **High memory usage**
   - Check for memory leaks
   - Review cache sizes
   - Adjust resource limits

4. **Slow performance**
   - Review database indexes
   - Check cache hit rates
   - Analyze query performance

## Support & Resources

- **Documentation**: `/docs`
- **Kubernetes**: `/k8s`
- **Scripts**: `/scripts`
- **GitHub Issues**: https://github.com/debs-daitani/supernova-build/issues

## License

MIT License - See LICENSE file for details
