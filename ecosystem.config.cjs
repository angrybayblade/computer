/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "me",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3001",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
