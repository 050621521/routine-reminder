#!/usr/bin/env node
/**
 * Routine Reminder - Cross-platform Setup Script
 * Works on Windows, macOS, Linux
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const DESKTOP = path.join(require('os').homedir(), 'Desktop');
const ROUTINE_FILE = path.join(DESKTOP, 'routine.json');
const SKILL_DIR = path.resolve(__dirname, '..');

async function main() {
  console.log('🦞 Routine Reminder 安装\n');

  // Step 1: Ensure routine.json exists
  if (!fs.existsSync(ROUTINE_FILE)) {
    console.log('📝 创建示例规划...');
    fs.writeFileSync(ROUTINE_FILE, JSON.stringify({
      routine: [
        { activity: '工作', start: '09:00', end: '12:00', enabled: true, days: [1,2,3,4,5], category: '工作' },
        { activity: '午休', start: '12:00', end: '13:00', enabled: true, days: [1,2,3,4,5], category: '休息' },
        { activity: '运动', start: '18:00', end: '19:00', enabled: true, days: [1,3,5], category: '健康' }
      ]
    }, null, 2));
    console.log(`   ✅ 已创建 ${ROUTINE_FILE}\n`);
  } else {
    console.log(`✅ routine.json 已存在\n`);
  }

  // Step 2: Copy files to Desktop
  console.log('📦 安装到桌面...');
  fs.copyFileSync(path.join(SKILL_DIR, 'assets', 'index.html'), path.join(DESKTOP, 'index.html'));
  fs.copyFileSync(path.join(SKILL_DIR, 'scripts', 'server.js'), path.join(DESKTOP, 'server.js'));

  // Create start script
  if (process.platform === 'win32') {
    fs.writeFileSync(path.join(DESKTOP, '启动规划.bat'), '@echo off\nnode "%~dp0server.js"\npause');
  } else {
    fs.writeFileSync(path.join(DESKTOP, '启动规划.command'), '#!/bin/bash\ncd "$(dirname "$0")"\nnode server.js\n');
    fs.chmodSync(path.join(DESKTOP, '启动规划.command'), '755');
  }
  console.log('   ✅ 桌面已就绪：routine.json + index.html + server.js + 启动脚本\n');

  // Step 3: Detect channel info
  console.log('🔍 检测 OpenClaw 配置...');
  let channel = '', chatId = '', accountId = '';

  try {
    const sessionsRaw = execSync('openclaw sessions list --json', { encoding: 'utf8', timeout: 5000 });
    const sessions = JSON.parse(sessionsRaw);
    if (Array.isArray(sessions) && sessions.length > 0) {
      console.log('检测到以下会话：');
      sessions.slice(0, 5).forEach(s => console.log(`  - ${s.key || s.sessionKey || ''}`));
      console.log('');
    }
  } catch (e) {
    console.log('⚠️  无法自动检测聊天渠道。\n');
  }

  channel = await ask('Channel 名称 (如 openclaw-weixin): ');
  chatId = await ask('Chat ID: ');
  accountId = await ask('Account ID (可选，直接回车跳过): ');

  if (!channel || !chatId) {
    console.log('❌ Channel 和 Chat ID 不能为空');
    rl.close();
    process.exit(1);
  }

  // Step 4: Build agent prompt
  let agentPrompt = fs.readFileSync(path.join(SKILL_DIR, 'references', 'agent-prompt.txt'), 'utf8');
  agentPrompt = agentPrompt
    .replace(/\{\{SESSION_KEY\}\}/g, `agent:main:${channel}:direct:${chatId}`)
    .replace(/\{\{ROUTINE_PATH\}\}/g, ROUTINE_FILE);

  // Step 5: Build cron command
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

  console.log('\n📋 即将创建 cron 任务：');
  console.log(`   渠道: ${channel} -> ${chatId}`);
  console.log(`   文件: ${ROUTINE_FILE}\n`);

  const confirm = await ask('确认创建？(y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('已取消。');
    rl.close();
    process.exit(0);
  }

  // Step 6: Create cron job
  console.log('⏳ 创建 cron 任务...');
  try {
    const result = execSync(`openclaw ${cronArgs.join(' ')}`, { encoding: 'utf8', timeout: 15000 });
    const parsed = JSON.parse(result);
    const jobId = parsed.id || 'unknown';

    console.log('\n✅ 安装完成！\n');
    console.log('   桌面上有以下文件：');
    console.log('   ├── routine.json     ← 规划数据');
    console.log('   ├── index.html       ← 网页编辑器');
    console.log('   ├── server.js        ← 本地服务');
    console.log('   └── 启动规划.command  ← 双击启动\n');
    console.log('📌 使用方式：');
    console.log('   双击「启动规划」→ 自动打开网页 → 编辑 → 点保存\n');
    console.log(`   Cron ID: ${jobId}`);
    console.log(`   查看任务: openclaw cron list`);
    console.log(`   手动触发: openclaw cron run ${jobId}\n`);
    console.log('提醒会在每个活动开始前 ±5 分钟内通过微信发送。');
  } catch (e) {
    console.log('\n❌ 创建失败：');
    console.log(e.message);
  }

  rl.close();
}

main().catch(e => { console.error(e); rl.close(); process.exit(1); });
