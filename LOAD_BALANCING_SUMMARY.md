# ─── Load Balancing Implementation Summary ─────────────────────────────

## ✅ Files Created/Updated

| File | Purpose | Type |
|------|---------|------|
| `backend/.htaccess` | Enhanced Passenger config for cPanel | Updated |
| `backend/ecosystem.config.cjs` | PM2 cluster mode for multi-process | Updated |
| `backend/db/pool.js` | Read replica support + health checks | Updated |
| `Dockerfile` | Containerization | New |
| `docker-compose.yml` | Local dev with MySQL replicas + Redis | New |
| `nginx.conf` | Single-server NGINX with SSE support | New |
| `nginx-load-balancer.conf` | Multi-server NGINX LB | New |
| `cloudflare-load-balancer.md` | CloudFlare LB setup guide | New |
| `k8s/deployment.yaml` | Kubernetes deployment | New |
| `deploy.sh` | Automated deployment script | New |
| `.env.production.template` | Production env template | New |

---

## 🎯 Load Balancing Options for cPanel

### Option 1: Single cPanel - Passenger Multi-Process (Simplest)
```apache
# backend/.htaccess
PassengerMinInstances 3
PassengerMaxPoolSize 10
PassengerLoadBalancing smart
```
✅ No extra infrastructure | ❌ Single server only

### Option 2: Single cPanel - PM2 Cluster (Recommended for VPS)
```javascript
// ecosystem.config.cjs
instances: "max"
exec_mode: "cluster"
```
✅ Uses all CPU cores | ✅ Zero-downtime reload | ❌ Single server

### Option 3: Multi-Server - CloudFlare Load Balancer (Best for cPanel)
```markdown
# cloudflare-load-balancer.md
- No separate LB server needed
- Built-in health checks
- Cookie-based session affinity for SSE
- DDoS protection included
```
✅ True multi-server | ✅ Global CDN | ✅ SSL management

### Option 4: Multi-Server - Dedicated NGINX LB
```nginx
# nginx-load-balancer.conf
upstream backend_cluster {
    least_conn;
    server cpanel1:5000;
    server cpanel2:5000;
    server cpanel3:5000;
}
```
✅ Full control | ❌ Separate LB server needed

### Option 5: Kubernetes (For Scale)
```yaml
# k8s/deployment.yaml
- HPA with CPU/Memory/SSE metrics
- Rolling updates
- Multi-zone deployment
```
✅ Auto-scaling | ✅ Cloud-native | ❌ Complex

---

## 🔑 Critical SSE Configuration (All Options)

### Backend (Already Implemented)
```javascript
// blogController.js - Cross-instance SSE via Redis
distributedSSE = {
  addClient: async (clientId) => { await redis.sAdd("sse_clients", clientId) },
  broadcast: async (event, data) => { await redis.publish("sse_blogs", payload) }
}

// blogController.js - 15s Redis health check
setInterval(async () => { /* ping Redis, update redisAvailable */ }, 15000)
```

### Load Balancer (Critical Settings)
```nginx
# SSE Endpoint - NO BUFFERING, LONG TIMEOUTS
location /api/blogs/stream {
    proxy_buffering off;          # CRITICAL
    proxy_cache off;              # CRITICAL
    proxy_read_timeout 3600s;     # 1 hour
    proxy_send_timeout 3600s;     # 1 hour
    proxy_set_header Connection "";
}
```

### Session Affinity (Required for SSE)
| LB Solution | Configuration |
|-------------|---------------|
| CloudFlare | Session Affinity: Cookie (TTL: 3600s) |
| NGINX | `ip_hash` or `sticky cookie` |
| AWS ALB | Stickiness: Enabled (3600s) |
| Passenger | Built-in (single server) |

---

## 📊 Health Check Endpoint

```bash
curl https://jaivarahi.org/health
```

Response:
```json
{
  "status": "healthy",
  "instance": "cpanel1",
  "uptimeSeconds": 3600,
  "frontend": { "indexHtmlFound": true },
  "database": { "primary": true, "replicas": 2 },
  "redis": { "available": true },
  "sse": { "localClients": 5, "distributedClients": 15 }
}
```

---

## 🚀 Quick Start Commands

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Production Deploy (Single Server)
```bash
# On server
git pull origin main
./deploy.sh production
```

### Multi-Server (CloudFlare)
```bash
# 1. Deploy to each cPanel server
# Server 1
ssh cpanel1 "cd /home/jaivarahi/domains/jaivarahi.org/backend && git pull && ./deploy.sh production"

# Server 2
ssh cpanel2 "cd /home/jaivarahi/domains/jaivarahi.org/backend && git pull && ./deploy.sh production"

# 2. Configure CloudFlare Load Balancer (see cloudflare-load-balancer.md)
```

### Kubernetes Deploy
```bash
# Apply manifests
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods -n varahi -w
```

---

## 🔍 Monitoring Commands

```bash
# PM2 Monitoring
pm2 monit
pm2 logs jaivarahi-backend --lines 100

# NGINX Status
curl http://localhost:8080/nginx-status

# Health Check
curl https://jaivarahi.org/health | jq

# Redis SSE Clients
redis-cli -u $REDIS_URL SMEMBERS sse_clients

# Database Health
mysql -h $MYSQL_HOST -u $MYSQL_USER -p -e "SELECT 1"
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| SSE disconnects | Check `proxy_buffering off`, `proxy_read_timeout 3600s` |
| Session loss | Enable sticky sessions (cookie affinity) |
| Redis unavailable | Check 15s health check in blogController.js |
| DB replica lag | Check RDS replication lag metric |
| Memory leaks | `PassengerMaxRequests 10000` or PM2 `max_memory_restart` |
| 502 errors | Check backend health `/health` endpoint |

---

## 📋 Deployment Checklist

- [ ] Shared Redis Cluster configured
- [ ] Shared MySQL (RDS) with read replicas
- [ ] Shared S3/EFS for uploads
- [ ] Load balancer health checks passing
- [ ] Sticky sessions for SSE endpoints
- [ ] SSL certificates on all origins
- [ ] Environment variables on all servers
- [ ] Deploy script tested
- [ ] Rollback plan documented
- [ ] Alerting configured