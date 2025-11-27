# Netcup Guardian

专为 Debian 12 设计的 Netcup VPS 流量监控与自动化管理工具。

## 功能特性
- **流量监控**: 调用 Netcup SCP SOAP API 实时检测 VPS 是否被限速。
- **多账号支持**: 支持同时监控多个 Netcup 账号下的所有 VPS。
- **Vertex 联动**: 自动拉取 Vertex 下载器列表，通过 IP 自动匹配，限速时自动禁用下载器。
- **qBittorrent 控制**: 限速时自动暂停或删除种子。
- **Telegram 通知**: 状态变更实时推送。
- **Web 配置界面**: 提供可视化的配置生成器。

## 部署指南 (Debian 12)

1. **生成配置**:
   - 打开 Web 界面 (src/index.html)，推荐本地运行 `npm start` 或构建后打开。
   - 在“系统设置”中填写 Netcup 账号、Vertex 信息等。
   - 点击“保存配置”，下载 `config.json`。

2. **服务器部署**:
   ```bash
   # 1. 将项目代码上传至服务器
   # 2. 进入目录
   chmod +x scripts/install.sh
   sudo ./scripts/install.sh
   ```

3. **上传配置**:
   将第一步下载的 `config.json` 上传到 `/opt/netcup-guardian/` 目录。

4. **管理服务**:
   ```bash
   # 启动
   systemctl start netcup-guardian
   
   # 开机自启
   systemctl enable netcup-guardian
   
   # 查看实时日志 (重要)
   journalctl -u netcup-guardian -f
   ```
