module.exports = {
  apps: [
    {
      name: 'edutoon-backend',
      cwd: '/home/edutoon/edutoon',
      script: 'dist/main.js',   // <== pakai hasil build, BUKAN src
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};

