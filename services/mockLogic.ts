
import { VPS, LogEntry, AppConfig } from '../types';

export const generateMockLog = (level: LogEntry['level'], source: LogEntry['source'], message: string): LogEntry => ({
  id: Math.random().toString(36).substr(2, 9),
  timestamp: new Date(),
  level,
  source,
  message,
});

/**
 * 模拟检查流程
 */
export const simulateNetcupCheck = async (currentVpsList: VPS[], config: AppConfig): Promise<{ updatedList: VPS[], logs: LogEntry[] }> => {
  const logs: LogEntry[] = [];
  
  // 1. 模拟连接 Vertex 获取下载器列表
  // 我们模拟 Vertex 返回了 12 个下载器，其中 10 个匹配 Netcup，2 个是其他机器（应被忽略）
  logs.push(generateMockLog('info', 'Vertex', `正在连接 ${config.vertex.apiUrl} 获取客户端列表...`));
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 模拟从 Vertex API 获取的数据结构
  const mockVertexClients = [
    // 匹配 Netcup 的数据 (基于 currentVpsList 生成)
    ...currentVpsList.map((vps, idx) => ({
      id: `61c9a0${idx}`,
      alias: `NC-Worker-${idx+1}-320G`,
      host: vps.ip // 这里的 host 对应 VPS IP
    })),
    // 不匹配的数据 (其他机器)
    { id: '9999999a', alias: 'Home-NAS-QB', host: '192.168.1.100' },
    { id: '9999999b', alias: 'Seedbox-Hetzner', host: '5.100.200.15' }
  ];

  logs.push(generateMockLog('success', 'Vertex', `API 响应成功: 获取到 ${mockVertexClients.length} 个下载器配置`));

  // 2. 模拟多账号 Netcup 查询
  logs.push(generateMockLog('info', 'Netcup', `正在遍历 ${config.netcupAccounts.length} 个账号查询 VPS 状态...`));
  await new Promise(resolve => setTimeout(resolve, 500));

  const updatedList = currentVpsList.map(vps => {
    // 检查是否有覆盖配置
    const override = config.overrides.find(o => o.ip === vps.ip);
    const effectivePort = override?.port || config.qbittorrent.defaultPort;

    // --- Vertex 匹配逻辑 ---
    // 在 Vertex 列表中查找与当前 Netcup VPS IP 匹配的项
    const matchedClient = mockVertexClients.find(client => client.host === vps.ip);
    
    // 如果之前没有关联，现在关联上了，记录日志
    if (matchedClient && vps.linkedDownloaderId !== matchedClient.id) {
        logs.push(generateMockLog('info', 'System', `[自动发现] Netcup VPS ${vps.ip} <-> Vertex [${matchedClient.alias}] (${matchedClient.id})`));
    }

    const linkedId = matchedClient ? matchedClient.id : undefined;
    const linkedAlias = matchedClient ? matchedClient.alias : undefined;

    // --- 状态模拟 ---
    // 随机模拟状态变化 (5% 的概率发生变化，用于演示)
    const shouldChange = Math.random() > 0.95;
    
    // 即使状态没变，也要更新匹配到的 ID/Alias 信息
    if (!shouldChange) {
        return { 
            ...vps, 
            qbPort: effectivePort, 
            lastChecked: new Date(),
            linkedDownloaderId: linkedId,
            linkedDownloaderAlias: linkedAlias
        };
    }

    const newThrottledState = !vps.isThrottled;
    const actionName = config.monitoring.actionOnThrottle === 'delete' ? '删除种子' : '暂停种子';

    if (newThrottledState) {
        // --- 状态变为: 限速 (Throttled) ---
        logs.push(generateMockLog('warning', 'Netcup', `账号[${config.netcupAccounts[0]?.loginName || 'Unknown'}] 检测到限速: ${vps.name} (${vps.ip})`));
        
        // Telegram 通知
        if (config.telegram.botToken) {
             logs.push(generateMockLog('info', 'Telegram', `发送警报: ${vps.name} 已被限速，正在执行保护策略`));
        }

        // 1. Vertex 操作
        if (linkedId) {
            logs.push(generateMockLog('info', 'Vertex', `禁用下载器: ${linkedAlias} (${linkedId})`));
        } else {
             logs.push(generateMockLog('warning', 'Vertex', `IP ${vps.ip} 未在 Vertex 中找到对应下载器，跳过 Vertex 操作`));
        }

        // 2. qBittorrent 操作
        logs.push(generateMockLog('info', 'qBittorrent', `连接 ${vps.ip}:${effectivePort} 执行 ${actionName}...`));
        logs.push(generateMockLog('success', 'qBittorrent', `成功: ${vps.ip} 保护策略执行完毕`));
        
    } else {
        // --- 状态变为: 恢复正常 (Normal) ---
        logs.push(generateMockLog('success', 'Netcup', `限速解除: ${vps.name} (${vps.ip}) 流量恢复正常`));
        
         if (config.telegram.botToken) {
             logs.push(generateMockLog('info', 'Telegram', `发送通知: ${vps.name} 已恢复正常`));
        }

        // 1. Vertex 操作
        if (linkedId) {
            logs.push(generateMockLog('info', 'Vertex', `启用下载器: ${linkedAlias} (${linkedId})`));
        }

        // 2. qBittorrent 操作
        logs.push(generateMockLog('info', 'qBittorrent', `连接 ${vps.ip}:${effectivePort} 恢复任务...`));
    }

    return {
      ...vps,
      qbPort: effectivePort,
      isThrottled: newThrottledState,
      lastChecked: new Date(),
      linkedDownloaderId: linkedId,
      linkedDownloaderAlias: linkedAlias
    };
  });

  return { updatedList, logs };
};
