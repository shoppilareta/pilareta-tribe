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

    // Start command — use next directly so PM2 can track the process
    script: 'node_modules/.bin/next',
    args: 'start',

    // Working directory
    cwd: '/var/www/pilareta-tribe',

    // Fork mode — Next.js manages its own workers internally
    exec_mode: 'fork',

    // Auto-restart on crash
    autorestart: true,

    // Don't watch files (use manual restarts for production)
    watch: false,

    // Restart if memory exceeds this limit
    // Instance has ~916MB RAM — leave room for PostgreSQL, Nginx, OS
    max_memory_restart: '450M',

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
    kill_timeout: 5000
  }]
};
