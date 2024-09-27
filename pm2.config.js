module.exports = {
  apps: [
    {
      name: 'employee-training-platform',
      script: 'dist/main.js',
      instances: 1, // Or a number of instances
      exec_mode: 'cluster',
      watch: true, // Optional: Restart on file changes
    },
  ],
};
