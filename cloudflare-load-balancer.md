# ─── CloudFlare Load Balancer Setup (Easiest for cPanel) ───────────────
# No separate LB server needed - CloudFlare handles it

## 1. Create Origin Pools in CloudFlare Dashboard

### Pool 1: Primary (cPanel Server 1)
- **Name**: `cpanel-primary`
- **Origins**: 
  - `cpanel1.jaivarahi.org` (port 5000 or 443)
- **Health Check**: `/health` (HTTPS, port 443, interval 60s)

### Pool 2: Secondary (cPanel Server 2)
- **Name**: `cpanel-secondary`
- **Origins**:
  - `cpanel2.jaivarahi.org` (port 5000 or 443)
- **Health Check**: `/health` (HTTPS, port 443, interval 60s)

## 2. Create Load Balancer
- **Name**: `jaivarahi-lb`
- **Domain**: `jaivarahi.org`
- **Default Pool**: `cpanel-primary`
- **Fallback Pool**: `cpanel-secondary`
- **Steering Policy**: `random` (or `geo` for geographic routing)
- **Session Affinity**: `cookie` (for SSE sticky sessions)

## 3. Configure Load Balancer Rules

### Rule 1: SSE Endpoint (Sticky Sessions Required)
```
URL Pattern: /api/blogs/stream/*
Action: Override session affinity
Session Affinity: cookie
TTL: 3600s (1 hour)
```

### Rule 2: Admin Panel
```
URL Pattern: /admin/*
Action: Override session affinity
Session Affinity: cookie
TTL: 3600s
```

### Rule 3: API Endpoints
```
URL Pattern: /api/*
Action: Default load balancing
```

## 4. Health Check Configuration
```json
{
  "path": "/health",
  "type": "HTTPS",
  "port": 443,
  "interval": 60,
  "retries": 2,
  "timeout": 10,
  "follow_redirects": true,
  "header": {
    "Host": ["jaivarahi.org"]
  },
  "expected_codes": "200"
}
```

## 5. SSL/TLS Settings
- **SSL Mode**: Full (Strict)
- **Edge Certificates**: Let's Encrypt or Custom
- **Origin CA Certificates**: Generate in CloudFlare for each cPanel server
- **Always Use HTTPS**: On
- **Automatic HTTPS Rewrites**: On

## 6. Page Rules for Performance
```
# Cache static assets
jaivarahi.org/*.js  -> Cache Level: Cache Everything, Edge Cache TTL: 1 month
jaivarahi.org/*.css  -> Cache Level: Cache Everything, Edge Cache TTL: 1 month
jaivarahi.org/*.png  -> Cache Level: Cache Everything, Edge Cache TTL: 1 month

# Bypass cache for API
jaivarahi.org/api/*  -> Cache Level: Bypass

# SSE - no cache
jaivarahi.org/api/blogs/stream*  -> Cache Level: Bypass, Disable Performance
```

## 7. Workers (Optional - Advanced SSE Handling)
```javascript
// CloudFlare Worker for SSE sticky sessions
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // SSE endpoints need sticky sessions
  if (url.pathname.startsWith('/api/blogs/stream')) {
    const cookie = request.headers.get('Cookie') || ''
    const affinity = cookie.match(/lb_affinity=([^;]+)/)
    
    if (!affinity) {
      // Assign to random origin, set cookie
      const response = await fetch(request)
      const newResponse = new Response(response.body, response)
      newResponse.headers.set('Set-Cookie', `lb_affinity=${Math.random()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`)
      return newResponse
    }
  }
  
  return fetch(request)
}
```

## 8. Environment Variables for Each cPanel Server

### Server 1 (.env)
```bash
INSTANCE_ID=cpanel1
REDIS_URL=redis://redis-cluster:6379
MYSQL_HOST=mysql-primary.internal
MYSQL_REPLICA_HOSTS=mysql-replica1.internal,mysql-replica2.internal
```

### Server 2 (.env)
```bash
INSTANCE_ID=cpanel2
REDIS_URL=redis://redis-cluster:6379
MYSQL_HOST=mysql-primary.internal
MYSQL_REPLICA_HOSTS=mysql-replica1.internal,mysql-replica2.internal
```

## 9. Redis Cluster (Required for Cross-Instance SSE)
```bash
# Use AWS ElastiCache or self-hosted Redis Cluster
# 3 masters + 3 replicas minimum

REDIS_URL=redis://redis-cluster.xxx.use1.cache.amazonaws.com:6379
```

## 10. Database Setup (Shared MySQL)
```bash
# Use AWS RDS or shared MySQL
# Primary for writes, replicas for reads

MYSQL_HOST=mysql-primary.cluster-xyz.us-east-1.rds.amazonaws.com
MYSQL_REPLICA_HOSTS=mysql-replica1.cluster-xyz.us-east-1.rds.amazonaws.com,mysql-replica2.cluster-xyz.us-east-1.rds.amazonaws.com
```

## 11. File Storage (Shared)
```bash
# Use S3 or EFS for uploads
UPLOAD_DRIVER=s3
S3_BUCKET=jaivarahi-uploads
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

## 12. Deployment Checklist

- [ ] Create 2+ cPanel accounts on different servers
- [ ] Configure shared Redis Cluster
- [ ] Configure shared MySQL (RDS) with replicas
- [ ] Configure shared S3/EFS for uploads
- [ ] Set up CloudFlare Load Balancer with health checks
- [ ] Configure session affinity for SSE endpoints
- [ ] Test failover by stopping one server
- [ ] Monitor `/health` endpoints
- [ ] Set up alerts for pool health

## 13. Monitoring

### CloudFlare Analytics
- Load Balancer Analytics → Origin Health
- Request Volume per Origin
- Error Rates per Origin

### Server-Side (Each cPanel)
```bash
# PM2 Monitoring
pm2 monit

# Logs
tail -f logs/pm2-out.log
tail -f logs/pm2-err.log
```

### Health Check Endpoint Response
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