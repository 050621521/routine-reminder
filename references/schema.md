# routine.json Schema

## 顶层结构

```json
{
  "routine": [...],
  "syncedAt": "2026-05-17T17:29:30.652Z"
}
```

## routine 数组元素

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 否 | 唯一标识，自动生成（如 `r-1779032662570`） |
| `activity` | string | 是 | 活动名称 |
| `start` | string | 是 | 开始时间，HH:mm 格式 |
| `end` | string | 是 | 结束时间，HH:mm 格式 |
| `enabled` | boolean | 是 | 是否启用 |
| `days` | number[] | 是 | 生效的星期几（0=周日, 1=周一 ... 6=周六） |
| `color` | string | 否 | 显示颜色（UI 用） |
| `category` | string | 否 | 分类标签 |
| `overnight` | boolean | 否 | 是否跨午夜 |

## 示例

```json
{
  "routine": [
    {
      "activity": "睡眠",
      "start": "00:00",
      "end": "07:00",
      "enabled": true,
      "days": [0, 1, 2, 3, 4, 5, 6],
      "overnight": true,
      "category": "睡眠"
    },
    {
      "activity": "工作",
      "start": "10:00",
      "end": "11:30",
      "enabled": true,
      "days": [1, 2, 3, 4, 5],
      "category": "工作"
    },
    {
      "activity": "读书",
      "start": "23:00",
      "end": "23:59",
      "enabled": false,
      "days": [1, 2, 3, 4, 5, 6, 0],
      "category": "学习"
    }
  ]
}
```

## 匹配规则

提醒触发条件（同时满足）：
1. `enabled` 为 `true`
2. `days` 包含当前星期几
3. 当前时间在 `start` ±5 分钟内
