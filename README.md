# 🦞 Routine Reminder

每日循环规划提醒 [OpenClaw](https://github.com/openclaw/openclaw) Skill。

读取 `routine.json` 中的每日规划，在活动开始前自动通过微信发送提醒。

## 功能

- ⏰ 每 5 分钟自动检查规划
- 📅 支持按星期几设置不同规划
- 🔔 通过微信发送提醒
- 📝 纯 JSON 配置，简单直观
- 🌐 内置网页编辑器，可视化管理规划
- 💾 直接读写本地文件，不需要启动服务器

## 快速安装

```bash
cd ~/.local/lib/node_modules/openclaw/skills
git clone https://github.com/050621521/routine-reminder.git
cd routine-reminder
node scripts/setup.js
```

安装完成后桌面上会有两个文件：
- `routine.json` — 你的规划数据
- `index.html` — 网页编辑器

## 使用方法

1. 双击桌面的 `index.html` 打开编辑器
2. 点「📂 打开文件」选择桌面的 `routine.json`
3. 编辑规划，点「💾 保存到文件」
4. 到点微信自动提醒

## routine.json 格式

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
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `activity` | 活动名称 |
| `start` | 开始时间（HH:mm） |
| `end` | 结束时间（HH:mm） |
| `enabled` | 是否启用 |
| `days` | 生效星期（0=周日, 1=周一 ... 6=周六） |
| `category` | 分类标签（可选） |

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
- Node.js（OpenClaw 自带）
- 已配置的微信渠道（openclaw-weixin）
- 现代浏览器（Chrome/Edge 86+ 支持直接读写文件）

## License

MIT
