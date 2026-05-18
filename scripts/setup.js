#!/usr/bin/env node
/**
 * Routine Reminder - Cross-platform Setup Script
 * Auto-detects channel, starts server, creates cron job
 * Works on Windows, macOS, Linux
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');
const os = require('os');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const SKILL_DIR = path.resolve(__dirname, '..');

async function main() {
  console.log('🦞 Routine Reminder 安装\n');

  // Step 1: Choose install location
  const defaultDir = path.join(os.homedir(), 'Desktop');
  console.log(`默认安装位置: ${defaultDir}`);
  const customDir = await ask('安装位置 (直接回车使用默认): ');
  const installDir = customDir.trim() || defaultDir;

  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
  }

  const routineFile = path.join(installDir, 'routine.json');

  // Step 2: Create routine.json if not exists
  if (!fs.existsSync(routineFile)) {
    fs.writeFileSync(routineFile, JSON.stringify({
      routine: [
        { activity: '工作', start: '09:00', end: '12:00', enabled: true, days: [1,2,3,4,5], category: '工作' },
        { activity: '午休', start: '12:00', end: '13:00', enabled: true, days: [1,2,3,4,5], category: '休息' },
        { activity: '运动', start: '18:00', end: '19:00', enabled: true, days: [1,3,5], category: '健康' }
      ]
    }, null, 2));
    console.log(`✅ 已创建示例规划: ${routineFile}`);
  } else {
    console.log(`✅ 规划文件已存在: ${routineFile}`);
  }

  // Step 3: Copy files
  fs.copyFileSync(path.join(SKILL_DIR, 'assets', 'index.html'), path.join(installDir, 'index.html'));
  fs.copyFileSync(path.join(SKILL_DIR, 'scripts', 'server.js'), path.join(installDir, 'server.js'));

  // Create start script
  if (process.platform === 'win32') {
    fs.writeFileSync(path.join(installDir, '启动规划.bat'), '@echo off\nnode "%~dp0server.js"\npause');
  } else {
    fs.writeFileSync(path.join(installDir, '启动规划.command'), '#!/bin/bash\ncd "$(dirname "$0")"\nnode server.js\n');
    fs.chmodSync(path.join(installDir, '启动规划.command'), '755');
  }
  console.log(`✅ 文件已安装到: ${installDir}`);

  // Step 4: Auto-detect channel and chat_id
  console.log('\n🔍 自动检测 OpenClaw 配置...');
  let channel = '', chatId = '', accountId = '';

  try {
    // Get current sessions to find active channel
    const sessionsRaw = execSync('openclaw sessions list --json', { encoding: 'utf8', timeout: 5000 });
    const sessions = JSON.parse(sessionsRaw);

    if (Array.isArray(sessions) && sessions.length > 0) {
      // Find the most recent direct chat session
      const directSession = sessions.find(s => {
        const key = s.key || s.sessionKey || '';
        return key.includes(':direct:') && !key.includes(':cron:');
      }) || sessions[0];

      const key = directSession.key || directSession.sessionKey || '';
      // Parse channel and chat_id from session key: agent:main:<channel>:direct:<chat_id>
      const parts = key.split(':');
      if (parts.length >= 5) {
        channel = parts[2];
        chatId = parts.slice(4).join(':');
      }

      if (channel && chatId) {
        console.log(`   ✅ 检测到: ${channel} -> ${chatId}`);
      }
    }
  } catch (e) {
    console.log('   ⚠️ 自动检测失败，请手动输入');
  }

  if (!channel || !chatId) {
    console.log('\n请手动输入聊天渠道信息：');
    channel = await ask('Channel 名称 (如 openclaw-weixin): ');
    chatId = await ask('Chat ID: ');
    accountId = await ask('Account ID (可选，直接回车跳过): ');
  }

  if (!channel || !chatId) {
    console.log('❌ Channel 和 Chat ID 不能为空');
    rl.close();
    process.exit(1);
  }

  // Step 5: Start server in background
  console.log('\n🚀 启动本地服务...');
  const serverProc = spawn('node', [path.join(installDir, 'server.js')], {
    detached: true,
    stdio: 'ignore'
  });
  serverProc.unref();
  console.log('   ✅ 服务已启动 (后台运行)');

  // Step 6: Build and create cron job
  let agentPrompt = fs.readFileSync(path.join(SKILL_DIR, 'references', 'agent-prompt.txt'), 'utf8');
  agentPrompt = agentPrompt
    .replace(/\{\{SESSION_KEY\}\}/g, `agent:main:${channel}:direct:${chatId}`)
    .replace(/\{\{ROUTINE_PATH\}\}/g, routineFile);

  console.log('\n📋 创建 cron 提醒任务...');
  try {
    const cronArgs = [
      'cron', 'add',
      '--name', '每日规划提醒',
      '--description', '每5分钟检查每日规划，通过聊天渠道提醒',
      '--cron', '*/5 * * * *',
      '--tz', 'Asia/Shanghai',
      '--session', 'isolated',
      '--message', agentPrompt,
      '--announce',
      '--channel', channel,
      '--to', chatId
    ];
    if (accountId) cronArgs.push('--account', accountId);

    const result = execSync(`openclaw ${cronArgs.join(' ')}`, { encoding: 'utf8', timeout: 15000 });
    const parsed = JSON.parse(result);
    const jobId = parsed.id || 'unknown';

    console.log('   ✅ cron 任务已创建');
    console.log(`   Cron ID: ${jobId}\n`);

    console.log('🎉 安装完成！\n');
    console.log(`   📁 安装位置: ${installDir}`);
    console.log('   ├── routine.json     ← 编辑你的规划');
    console.log('   ├── index.html       ← 网页编辑器');
    console.log('   ├── server.js        ← 本地服务');
    console.log('   └── 启动规划          ← 双击启动\n');
    console.log('📌 使用方式:');
    console.log('   1. 双击「启动规划」打开网页');
    console.log('   2. 编辑规划，点「💾 保存到文件」');
    console.log('   3. 到点微信自动提醒\n');
    console.log('   服务已在后台运行，重启电脑后双击「启动规划」重新启动。');

    // Auto-open browser
    try {
      const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      execSync(`${openCmd} "http://127.0.0.1:19831"`, { timeout: 3000 });
    } catch(e) {}
  } catch (e) {
    console.log('\n❌ cron 创建失败：');
    console.log(e.message);
    console.log('\n文件已安装，可以手动创建 cron 任务。');
  }

  rl.close();
}

main().catch(e => { console.error(e); rl.close(); process.exit(1); });
