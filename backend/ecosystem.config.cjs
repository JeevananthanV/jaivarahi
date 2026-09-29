module.exports = {
  apps: [
    {
      name: "jaivarahi-backend",
      script: "./server.js",
      instances: process.env.PM2_INSTANCES || "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      kill_timeout: 5000,
      listen_timeout: 8000,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,
      max_restarts: 15,
      env: {
        NODE_ENV: "development",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      },
      error_file: "./logs/pm2-err.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true
    }
  ]
};
