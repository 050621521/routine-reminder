#!/usr/bin/env node
/**
 * Routine Reminder - Cross-platform Start Script
 * Starts sync server + opens browser
 * Works on Windows, macOS, Linux
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SKILL_DIR = path.resolve(__dirname, '..');
const WORKSPACE = process.env.OPENCLAW_WORKSPACE || path.join(require('os').homedir(), '.openclaw', 'workspace');
const SYNC_SERVER = path.join(WORKSPACE, 'time-planner', 'sync-server.js');
const INDEX_HTML = path.join(WORKSPACE, 'time-planner', 'index.html');

// Copy files if not exist
if (!fs.existsSync(SYNC_SERVER)) {
  fs.copyFileSync(path.join(SKILL_DIR, 'scripts', 'sync-server.js'), SYNC_SERVER);
}
if (!fs.existsSync(INDEX_HTML)) {
  fs.copyFileSync(path.join(SKILL_DIR, 'assets', 'index.html'), INDEX_HTML);
}

// Start sync server
console.log('🚀 启动每日规划同步服务...');
const server = spawn('node', [SYNC_SERVER], { stdio: 'inherit' });

// Open browser
setTimeout(() => {
  const url = `file://${INDEX_HTML}`;
  try {
    if (process.platform === 'darwin') {
      execSync(`open "${INDEX_HTML}"`);
    } else if (process.platform === 'win32') {
      execSync(`start "" "${INDEX_HTML}"`, { shell: true });
    } else {
      execSync(`xdg-open "${INDEX_HTML}"`);
    }
    console.log('🌐 已打开网页编辑器');
  } catch (e) {
    console.log(`🌐 请手动打开: ${INDEX_HTML}`);
  }
}, 500);

console.log('✅ 同步服务已启动');
console.log('📝 编辑完规划后点「🔄 同步提醒」即可保存');
console.log('🛑 按 Ctrl+C 停止服务\n');

process.on('SIGINT', () => { server.kill(); process.exit(0); });
process.on('SIGTERM', () => { server.kill(); process.exit(0); });
