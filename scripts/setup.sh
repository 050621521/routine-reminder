#!/bin/bash
# Routine Reminder - Setup Script
# 自动配置每日规划提醒 cron 任务

set -e

WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
ROUTINE_FILE="$WORKSPACE/time-planner/routine.json"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🦞 Routine Reminder 安装"
echo ""

# Step 1: Check routine.json
if [ ! -f "$ROUTINE_FILE" ]; then
    echo "📝 routine.json 不存在，创建示例文件..."
    mkdir -p "$(dirname "$ROUTINE_FILE")"
    cat > "$ROUTINE_FILE" << 'EOF'
{
  "routine": [
    {
      "activity": "工作",
      "start": "09:00",
      "end": "12:00",
      "enabled": true,
      "days": [1, 2, 3, 4, 5],
      "category": "工作"
    },
    {
      "activity": "午休",
      "start": "12:00",
      "end": "13:00",
      "enabled": true,
      "days": [1, 2, 3, 4, 5],
      "category": "休息"
    },
    {
      "activity": "运动",
      "start": "18:00",
      "end": "19:00",
      "enabled": true,
      "days": [1, 3, 5],
      "category": "健康"
    }
  ]
}
EOF
    echo "   ✅ 已创建 $ROUTINE_FILE"
    echo "   请编辑此文件添加你的日常规划。"
    echo ""
else
    echo "✅ routine.json 已存在: $ROUTINE_FILE"
    echo ""
fi

# Step 2: Detect channel info
echo "🔍 检测 OpenClaw 配置..."

# Try to get sessions info
SESSIONS_JSON=$(openclaw sessions list --json 2>/dev/null || echo "[]")

if [ -z "$SESSIONS_JSON" ] || [ "$SESSIONS_JSON" = "[]" ]; then
    echo "⚠️  无法自动检测聊天渠道。"
    echo ""
    echo "请手动提供以下信息："
    read -p "Channel 名称 (如 openclaw-weixin, telegram, discord): " CHANNEL
    read -p "Chat ID (如 o9cq802UR12TbmfF8EayQtRjRKH0@im.wechat): " CHAT_ID
    read -p "Account ID (可选，直接回车跳过): " ACCOUNT_ID
else
    echo "检测到以下会话："
    echo "$SESSIONS_JSON" | python3 -c "
import json, sys
try:
    sessions = json.load(sys.stdin)
    if isinstance(sessions, list):
        for s in sessions[:5]:
            key = s.get('key', s.get('sessionKey', ''))
            print(f'  - {key}')
except:
    pass
" 2>/dev/null
    echo ""
    echo "请从上面选择或手动输入："
    read -p "Channel 名称 (如 openclaw-weixin): " CHANNEL
    read -p "Chat ID: " CHAT_ID
    read -p "Account ID (可选，直接回车跳过): " ACCOUNT_ID
fi

if [ -z "$CHANNEL" ] || [ -z "$CHAT_ID" ]; then
    echo "❌ Channel 和 Chat ID 不能为空"
    exit 1
fi

# Step 3: Build agent prompt
AGENT_PROMPT=$(cat "$SKILL_DIR/references/agent-prompt.txt" | \
    sed "s|AGENT_MAIN_SESSION_KEY|agent:main:${CHANNEL}:direct:${CHAT_ID}|g" | \
    sed "s|/Users/kwy/.openclaw/workspace|$WORKSPACE|g")

# Step 4: Build cron command
CRON_CMD="openclaw cron add \
  --name '每日规划提醒' \
  --description '每5分钟检查每日规划，通过聊天渠道提醒' \
  --cron '*/5 * * * *' \
  --tz 'Asia/Shanghai' \
  --session isolated \
  --message '$(echo "$AGENT_PROMPT" | sed "s/'/'\\''/g")' \
  --announce \
  --channel '$CHANNEL' \
  --to '$CHAT_ID'"

if [ -n "$ACCOUNT_ID" ]; then
    CRON_CMD="$CRON_CMD --account '$ACCOUNT_ID'"
fi

echo ""
echo "📋 即将创建以下 cron 任务："
echo "   名称: 每日规划提醒"
echo "   频率: 每 5 分钟"
echo "   渠道: $CHANNEL -> $CHAT_ID"
echo "   文件: $ROUTINE_FILE"
echo ""
read -p "确认创建？(y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "已取消。"
    exit 0
fi

# Step 5: Create cron job
echo "⏳ 创建 cron 任务..."
RESULT=$(eval "$CRON_CMD" 2>&1)

if echo "$RESULT" | grep -q '"ok": true\|"id":'; then
    JOB_ID=$(echo "$RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id','unknown'))" 2>/dev/null || echo "unknown")
    echo ""
    echo "✅ 安装完成！"
    echo ""
    echo "   Cron ID: $JOB_ID"
    echo "   规划文件: $ROUTINE_FILE"
    echo ""
    echo "📌 常用命令："
    echo "   查看任务:    openclaw cron list"
    echo "   手动触发:    openclaw cron run $JOB_ID"
    echo "   查看历史:    openclaw cron runs --id $JOB_ID"
    echo "   编辑规划:    编辑 $ROUTINE_FILE"
    echo ""
    echo "提醒会在每个活动开始前 ±5 分钟内通过 $CHANNEL 发送。"
else
    echo ""
    echo "❌ 创建失败："
    echo "$RESULT"
    exit 1
fi
