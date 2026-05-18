---
name: routine-reminder
description: |
  定时规划提醒系统。读取 routine.json 中的每日循环规划，在活动开始前通过当前聊天渠道发送提醒。
  使用场景：用户想设置每日循环提醒（如作息、工作计划），或管理 routine.json 规划文件。
  触发关键词：提醒、规划、routine、定时提醒、日程提醒、作息提醒。
---

# Routine Reminder

基于 routine.json 的每日循环规划提醒系统。

## 快速开始

1. 创建 routine.json（见 [references/schema.md](references/schema.md)）
2. 运行安装脚本：`bash scripts/setup.sh`
3. 完成，每 5 分钟自动检查并提醒

## routine.json 格式

文件路径：`~/.openclaw/workspace/time-planner/routine.json`

```json
{
  "routine": [
    {
      "activity": "做项目",
      "start": "12:00",
      "end": "13:30",
      "enabled": true,
      "days": [1, 2, 3, 4, 5]
    }
  ]
}
```

- `days`: 0=周日, 1=周一 ... 6=周六
- `enabled`: false 跳过该规划
- 完整字段说明见 [references/schema.md](references/schema.md)

## 安装

运行安装脚本（跨平台，需要 Node.js）：

```bash
node scripts/setup.js
```

脚本会：
1. 检查 routine.json 是否存在（不存在则创建示例）
2. 复制网页编辑器和同步服务到 workspace
3. 检测当前 OpenClaw 的 channel 和 chat_id
4. 创建每 5 分钟执行的 cron 任务

### 手动安装

如果脚本不适用，手动创建 cron：

```bash
openclaw cron add \
  --name "每日规划提醒" \
  --cron "*/5 * * * *" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "$(cat references/agent-prompt.txt)" \
  --announce \
  --channel <your-channel> \
  --to "<your-chat-id>"
```

Agent 提示词模板见 [references/agent-prompt.txt](references/agent-prompt.txt)。

## 网页编辑器

项目自带网页版规划编辑器，打开 `index.html` 即可使用：

- 📅 按时间轴展示每日规划
- ✏️ 添加/编辑/删除规划
- 🏷️ 按分类颜色区分（工作、学习、健康等）
- 🔄 一键同步提醒

使用方式：
```bash
# 启动同步服务并自动打开网页
bash scripts/start.sh
```

编辑完规划后点「🔄 同步提醒」即可保存。

## 管理

```bash
# 查看所有 cron 任务
openclaw cron list

# 查看运行历史
openclaw cron runs --id <job-id>

# 手动触发一次
openclaw cron run <job-id>

# 禁用/启用
openclaw cron disable <job-id>
openclaw cron enable <job-id>

# 删除
openclaw cron rm <job-id>
```

## 自定义提醒窗口

默认在活动开始前 5 分钟内触发。修改 Agent 提示词中的 `±5 分钟` 可调整。
