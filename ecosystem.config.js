module.exports = {
  apps: [
    {
      name: 'edutoon-backend',
      cwd: '/www/wwwroot/edutoon',
      script: 'dist/backend/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'edutoon-frontend',
      cwd: '/www/wwwroot/edutoon/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3333',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
