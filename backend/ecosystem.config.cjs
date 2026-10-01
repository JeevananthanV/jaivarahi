module.exports = {
  apps: [
    {
      name: "jaivarahi-backend",
      script: "./server.js",
      instances: "max",              // Use all CPU cores
      exec_mode: "cluster",          // Cluster mode for load balancing
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      kill_timeout: 5000,
      listen_timeout: 8000,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,
      max_restarts: 15,
      
      // ─── Environment Variables ───────────────────────────────────────────
      env: {
        NODE_ENV: "development",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        // Worker-specific env
        WORKER_ID: "$(PM2_PROCESS_ID)",
        INSTANCE_ID: "$(PM2_INSTANCE_ID)"
      },

      // ─── Logging ─────────────────────────────────────────────────────────
      error_file: "./logs/pm2-err.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      log_type: "json",

      // ─── Advanced Cluster Settings ───────────────────────────────────────
      instance_var: "INSTANCE_ID",
      instances: process.env.PM2_INSTANCES || "max",
      
      // ─── Graceful Reload (Zero-Downtime Deploy) ───────────────────────────
      wait_ready: true,
      listen_timeout: 10000,
      graceful_reload_timeout: 30000,

      // ─── Health Monitoring ────────────────────────────────────────────────
      monitoring: true,

      // ─── Source Map Support ──────────────────────────────────────────────
      source_map_support: true,

      // ─── Module System ────────────────────────────────────────────────────
      interpreter: "node",
      interpreter_args: "--enable-source-maps",

      // ─── Restart Strategy ────────────────────────────────────────────────
      min_uptime: "10s",
      max_restarts: 10,

      // ─── SSE/WebSocket Support ───────────────────────────────────────────
      // In cluster mode, sticky sessions needed for WebSocket
      // For SSE, Redis Pub/Sub handles cross-instance (already implemented)
    }
  ],

  // ─── Deploy Configuration (PM2 Deploy) ──────────────────────────────────
  deploy: {
    production: {
      user: "jaivarahi",
      host: "jaivarahi.org",
      ref: "origin/main",
      repo: "git@github.com:JeevananthanV/jaivarahi.git",
      path: "/home/jaivarahi/domains/jaivarahi.org/backend",
      "pre-deploy-local": "npm run build",
      "post-deploy": "npm ci --production && pm2 reload ecosystem.config.cjs --env production",
      "pre-setup": "mkdir -p logs uploads"
    }
  }
};