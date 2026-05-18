# 🦞 Routine Reminder

每日循环规划提醒 [OpenClaw](https://github.com/openclaw/openclaw) Skill。

读取 `routine.json` 中的每日规划，在活动开始前自动通过微信发送提醒。

## 功能

- ⏰ 每 5 分钟自动检查规划
- 📅 支持按星期几设置不同规划
- 🔔 通过微信发送提醒
- 📝 纯 JSON 配置，简单直观

## 快速安装

```bash
cd ~/.local/lib/node_modules/openclaw/skills
git clone https://github.com/050621521/routine-reminder.git
```

## 使用方法

### 1. 创建规划文件

在 `~/.openclaw/workspace/time-planner/routine.json` 中定义你的每日规划：

```json
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
      "activity": "运动",
      "start": "18:00",
      "end": "19:00",
      "enabled": true,
      "days": [1, 3, 5],
      "category": "健康"
    }
  ]
}
```

**字段说明：**

| 字段 | 说明 |
|------|------|
| `activity` | 活动名称 |
| `start` | 开始时间（HH:mm） |
| `end` | 结束时间（HH:mm） |
| `enabled` | 是否启用 |
| `days` | 生效星期（0=周日, 1=周一 ... 6=周六） |
| `category` | 分类标签（可选） |

### 2. 运行安装脚本

```bash
cd ~/.local/lib/node_modules/openclaw/skills/routine-reminder
bash scripts/setup.sh
```

脚本会自动检测你的聊天渠道并创建 cron 任务。

### 3. 手动安装（可选）

```bash
openclaw cron add \
  --name "每日规划提醒" \
  --cron "*/5 * * * *" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message '你是每日规划提醒助手...' \
  --announce \
  --channel <your-channel> \
  --to "<your-chat-id>"
```

完整 Agent 提示词见 `references/agent-prompt.txt`。

## 提醒效果

在活动开始前 ±5 分钟内，你会收到类似这样的提醒：

> ⏰ 现在是 09:00，该开始「工作」了（09:00 - 12:00）

## 管理命令

```bash
# 查看任务
openclaw cron list

# 手动触发
openclaw cron run <job-id>

# 查看运行历史
openclaw cron runs --id <job-id>

# 禁用/启用
openclaw cron disable <job-id>
openclaw cron enable <job-id>

# 删除
openclaw cron rm <job-id>
```

## 依赖

- [OpenClaw](https://github.com/openclaw/openclaw) 2026.5+
- 已配置的微信渠道（openclaw-weixin）

## License

MIT
