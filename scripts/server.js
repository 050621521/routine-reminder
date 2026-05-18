const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 19831;
const DIR = __dirname;
const ROUTINE_FILE = path.join(DIR, 'routine.json');
const INDEX_FILE = path.join(DIR, 'index.html');

// 确保 routine.json 存在
if (!fs.existsSync(ROUTINE_FILE)) {
  fs.writeFileSync(ROUTINE_FILE, JSON.stringify({ routine: [] }, null, 2));
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // GET / - 返回网页
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(INDEX_FILE, 'utf8'));
    return;
  }

  // GET /routine - 返回数据
  if (req.method === 'GET' && req.url === '/routine') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(fs.readFileSync(ROUTINE_FILE, 'utf8'));
    return;
  }

  // POST /sync - 保存数据
  if (req.method === 'POST' && req.url === '/sync') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(ROUTINE_FILE, JSON.stringify(data, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, count: data.routine ? data.routine.length : 0 }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`✅ 每日规划服务已启动: ${url}`);
  console.log('📝 编辑完点「💾 保存到文件」即可');
  console.log('🛑 按 Ctrl+C 停止\n');

  // 自动打开浏览器
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${url}"`);
});
