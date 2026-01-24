/**
 * PM2 Ecosystem Configuration
 *
 * This file configures the PM2 process manager for production deployment.
 * Environment variables are loaded from .env.local (not hardcoded here for security).
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart ecosystem.config.js --update-env
 *   pm2 reload ecosystem.config.js
 *
 * Note: Copy this file to /var/www/pilareta-tribe/ on the server.
 */

module.exports = {
  apps: [{
    // Application name (used in PM2 commands)
    name: 'pilareta-tribe',

    // Start command
    script: 'npm',
    args: 'start',

    // Working directory
    cwd: '/var/www/pilareta-tribe',

    // Number of instances (1 for Next.js, or 'max' for clustering)
    instances: 1,

    // Auto-restart on crash
    autorestart: true,

    // Don't watch files (use manual restarts for production)
    watch: false,

    // Restart if memory exceeds this limit
    max_memory_restart: '1G',

    // Environment variables (base config, actual secrets in .env.local)
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Log configuration
    error_file: '/home/ec2-user/.pm2/logs/pilareta-tribe-error.log',
    out_file: '/home/ec2-user/.pm2/logs/pilareta-tribe-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
