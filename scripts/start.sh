#!/bin/bash
# Start sync server + open browser
cd "$(dirname "$0")"
echo "🚀 启动每日规划同步服务..."
node sync-server.js &
SERVER_PID=$!
sleep 1

# Open browser
if command -v open &>/dev/null; then
  open "$(dirname "$0")/index.html"
elif command -v xdg-open &>/dev/null; then
  xdg-open "$(dirname "$0")/index.html"
fi

echo "✅ 同步服务已启动 (PID: $SERVER_PID)"
echo "📝 编辑完规划后点「同步提醒」即可保存"
echo "🛑 按 Ctrl+C 停止服务"

# Keep running
wait $SERVER_PID
