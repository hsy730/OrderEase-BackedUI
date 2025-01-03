# OrderEase 订单管理系统

## 环境配置

项目使用 `.env` 文件管理环境变量。在项目根目录创建以下文件：

### 开发环境 (.env.development)
```bash
# API 基础路径
VITE_API_BASE_URL=https://gkbdewdnxhwz.sealoshzh.site
```

### 生产环境 (.env.production)
```bash
# API 基础路径
VITE_API_BASE_URL=https://gkbdewdnxhwz.sealoshzh.site
```

## 使用说明

1. 复制 `.env.example` 文件并重命名为 `.env.development`（开发环境）或 `.env.production`（生产环境）
2. 根据实际环境修改 `VITE_API_BASE_URL` 的值
3. 环境变量在代码中通过 `import.meta.env.VITE_API_BASE_URL` 访问

## 注意事项

- 所有以 `VITE_` 开头的变量都会被 Vite 暴露给客户端代码
- 修改环境变量后需要重启开发服务器
- 不要将包含敏感信息的环境文件提交到版本控制系统

