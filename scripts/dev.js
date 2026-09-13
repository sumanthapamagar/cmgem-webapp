#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

const frontendPath = path.join(__dirname, '..', 'frontend');
const backendPath = path.join(__dirname, '..', 'backend');

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    switch (command) {
      case 'dev':
        // Start both servers concurrently
        const frontend = spawn('npm', ['run', 'dev'], { cwd: frontendPath, stdio: 'inherit' });
        const backend = spawn('npm', ['run', 'dev'], { cwd: backendPath, stdio: 'inherit' });
        
        // Handle process termination
        process.on('SIGINT', () => {
          frontend.kill('SIGINT');
          backend.kill('SIGINT');
          process.exit(0);
        });
        
        // Wait for both processes
        await Promise.all([
          new Promise((resolve) => frontend.on('close', resolve)),
          new Promise((resolve) => backend.on('close', resolve))
        ]);
        break;

      case 'frontend':
        await runCommand('npm', ['run', 'dev'], frontendPath);
        break;

      case 'backend':
        await runCommand('npm', ['run', 'dev'], backendPath);
        break;

      case 'build':
        await runCommand('npm', ['run', 'build'], frontendPath);
        await runCommand('npm', ['run', 'build'], backendPath);
        break;

      case 'install':
        await runCommand('npm', ['install'], process.cwd());
        await runCommand('npm', ['install'], frontendPath);
        await runCommand('npm', ['install'], backendPath);
        break;

      case 'clean':
        await runCommand('npm', ['run', 'clean'], frontendPath);
        await runCommand('npm', ['run', 'clean'], backendPath);
        break;

      case 'preview':
        await runCommand('npm', ['run', 'preview'], frontendPath);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
