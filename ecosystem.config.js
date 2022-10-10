module.exports = {
  apps: [
    {
      name: 'todo',
      exec_mode: 'cluster',
      instances: '1',
      script: 'npm',
      args: ['run', 'prod'],
    },
  ],
}
