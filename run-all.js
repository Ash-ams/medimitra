const { spawn } = require('child_process');
const path = require('path');

console.log('🩺 Starting MediMitra Full Stack Application...\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Backend Server
const serverDir = path.join(__dirname, 'server');
console.log('🚀 Launching Backend Server on http://localhost:5051...');
const serverProcess = spawn(npmCmd, ['start'], {
  cwd: serverDir,
  shell: true,
  stdio: 'inherit'
});

// 2. Start Frontend Client
const clientDir = path.join(__dirname, 'client');
console.log('💻 Launching Frontend Client on http://localhost:3000...');
const clientProcess = spawn(npmCmd, ['start'], {
  cwd: clientDir,
  shell: true,
  stdio: 'inherit'
});

function cleanup() {
  console.log('\n🛑 Stopping MediMitra processes...');
  try { serverProcess.kill(); } catch (e) {}
  try { clientProcess.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
