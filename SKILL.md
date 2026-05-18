---
name: routine-reminder
description: |
  定时规划提醒系统。读取 routine.json 中的每日循环规划，在活动开始前自动通过微信发送提醒。
  使用场景：用户想设置每日循环提醒（如作息、工作计划），或管理 routine.json 规划文件。
  触发关键词：提醒、规划、routine、定时提醒、日程提醒、作息提醒。
---

# Routine Reminder

基于 routine.json 的每日循环规划提醒系统。

## 快速安装

```bash
node scripts/setup.js
```

安装脚本自动完成：选择安装位置 → 检测微信渠道 → 启动服务 → 创建 cron 任务 → 打开网页编辑器。

## 使用

1. 双击「启动规划」打开网页
2. 编辑规划，点「💾 保存到文件」
3. 到点微信自动提醒

不需要额外设置。

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

- `days`: 0=周日, 1=周一 ... 6=周六
- `enabled`: false 跳过该规划
- 完整字段说明见 [references/schema.md](references/schema.md)

## 网页编辑器

- 📅 时间轴 / 列表 / 统计三种视图
- ✏️ 点击添加/编辑/删除
- 🏷️ 分类颜色区分
- 💾 直接保存到 routine.json

## 管理

```bash
openclaw cron list                    # 查看任务
openclaw cron run <job-id>            # 手动触发
openclaw cron runs --id <job-id>      # 运行历史
openclaw cron disable <job-id>        # 禁用
openclaw cron rm <job-id>             # 删除
```
