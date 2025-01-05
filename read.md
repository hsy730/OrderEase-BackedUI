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


## 功能特性

### 基础功能
- 订单管理
- 商品管理
- 数据迁移（隐藏功能）

### 隐藏功能说明
#### 数据迁移功能
数据迁移功能默认不显示在菜单中。如需启用，请按以下步骤操作：

1. 打开浏览器开发者工具（F12）
2. 在 Console 中输入以下命令：
```javascript
localStorage.setItem('migration_switch', '1')
```
3. 刷新页面后，数据迁移菜单将显示在左侧导航栏中

如需隐藏该功能，请执行：
```javascript
localStorage.setItem('migration_switch', '0')
```
或
```javascript
localStorage.removeItem('migration_switch')
```


