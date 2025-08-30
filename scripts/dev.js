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
        console.log('🚀 Starting development servers...');
        console.log('Frontend will be available at: http://localhost:3000');
        console.log('Backend will be available at: http://localhost:3001');
        console.log('');
        
        // Start both servers concurrently
        const frontend = spawn('npm', ['run', 'dev'], { cwd: frontendPath, stdio: 'inherit' });
        const backend = spawn('npm', ['run', 'dev'], { cwd: backendPath, stdio: 'inherit' });
        
        // Handle process termination
        process.on('SIGINT', () => {
          console.log('\n🛑 Shutting down development servers...');
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
        console.log('🚀 Starting frontend development server...');
        await runCommand('npm', ['run', 'dev'], frontendPath);
        break;

      case 'backend':
        console.log('🚀 Starting backend development server...');
        await runCommand('npm', ['run', 'dev'], backendPath);
        break;

      case 'build':
        console.log('🔨 Building all applications...');
        await runCommand('npm', ['run', 'build'], frontendPath);
        await runCommand('npm', ['run', 'build'], backendPath);
        console.log('✅ Build completed successfully!');
        break;

      case 'install':
        console.log('📦 Installing dependencies...');
        await runCommand('npm', ['install'], process.cwd());
        await runCommand('npm', ['install'], frontendPath);
        await runCommand('npm', ['install'], backendPath);
        console.log('✅ Dependencies installed successfully!');
        break;

      case 'clean':
        console.log('🧹 Cleaning build artifacts...');
        await runCommand('npm', ['run', 'clean'], frontendPath);
        await runCommand('npm', ['run', 'clean'], backendPath);
        console.log('✅ Clean completed successfully!');
        break;

      case 'preview':
        console.log('👀 Starting frontend preview...');
        await runCommand('npm', ['run', 'preview'], frontendPath);
        break;

      default:
        console.log('CMGEM Monorepo Development Script');
        console.log('');
        console.log('Usage: node scripts/dev.js <command>');
        console.log('');
        console.log('Commands:');
        console.log('  dev       - Start both frontend and backend in development mode');
        console.log('  frontend  - Start only frontend development server');
        console.log('  backend   - Start only backend development server');
        console.log('  build     - Build all applications');
        console.log('  install   - Install dependencies for all workspaces');
        console.log('  clean     - Clean build artifacts');
        console.log('  preview   - Preview frontend application');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/dev.js dev');
        console.log('  node scripts/dev.js frontend');
        console.log('  node scripts/dev.js backend');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
