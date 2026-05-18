# 🦞 Routine Reminder

每日循环规划提醒 [OpenClaw](https://github.com/openclaw/openclaw) Skill。

读取 `routine.json` 中的每日规划，在活动开始前自动通过微信发送提醒。

## 功能

- ⏰ 每 5 分钟自动检查规划
- 📅 支持按星期几设置不同规划
- 🔔 通过微信发送提醒
- 🌐 内置网页编辑器，可视化管理规划
- 💾 直接保存，不需要额外操作

## 安装

```bash
cd ~/.local/lib/node_modules/openclaw/skills
git clone https://github.com/050621521/routine-reminder.git
cd routine-reminder
node scripts/setup.js
```

安装脚本会：
1. 让你选择安装位置（默认桌面）
2. 自动检测你的 OpenClaw 微信渠道
3. 启动本地服务
4. 创建 cron 提醒任务
5. 自动打开网页编辑器

## 使用

安装完成后：

1. **双击「启动规划」** 打开网页
2. 编辑规划，点 **「💾 保存到文件」**
3. 到点微信自动提醒

不需要任何额外设置。

## 管理

```bash
openclaw cron list                    # 查看任务
openclaw cron run <job-id>            # 手动触发
openclaw cron runs --id <job-id>      # 运行历史
openclaw cron disable <job-id>        # 禁用
openclaw cron rm <job-id>             # 删除
```

## 依赖

- [OpenClaw](https://github.com/openclaw/openclaw) 2026.5+
- Node.js
- 已配置的微信渠道（openclaw-weixin）

## License

MIT
