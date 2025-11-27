import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import StatsCard from './components/StatsCard';
import { Tab, AppConfig, VPS, LogEntry, VPSOverride, NetcupAccount } from './types';
import { DEFAULT_CONFIG, MOCK_VPS_LIST } from './constants';
import { simulateNetcupCheck } from './services/mockLogic';
import { RefreshCw, Power, AlertTriangle, CheckCircle, Info, Terminal, Download, Server, Plus, X, User, Lock, Users, Bell, Send, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [vpsList, setVpsList] = useState<VPS[]>(MOCK_VPS_LIST);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Use ref to track the latest state to avoid setInterval closure stale data
  const stateRef = useRef({ vpsList, config });
  useEffect(() => {
    stateRef.current = { vpsList, config };
  }, [vpsList, config]);

  // Init log
  useEffect(() => {
    setLogs([{
        id: 'init',
        timestamp: new Date(),
        level: 'info',
        source: 'System',
        message: '系统初始化完成。请在“系统设置”中配置参数，保存 config.json 并上传至服务器。'
    }]);
  }, []);

  // Monitoring Loop (Simulation)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isMonitoring) {
        handleManualCheck();

        interval = setInterval(async () => {
            const { vpsList: currentVpsList, config: currentConfig } = stateRef.current;
            
            const result = await simulateNetcupCheck(currentVpsList, currentConfig);
            setVpsList(result.updatedList);
            setLastCheckTime(new Date());
            if (result.logs.length > 0) {
                setLogs(prev => [...result.logs, ...prev].slice(0, 500)); 
            }
        }, config.monitoring.intervalSeconds * 1000);
    }

    return () => clearInterval(interval);
  }, [isMonitoring, config.monitoring.intervalSeconds]);

  const handleManualCheck = async () => {
    const { vpsList: currentVpsList, config: currentConfig } = stateRef.current;
    
    const result = await simulateNetcupCheck(currentVpsList, currentConfig);
    setVpsList(result.updatedList);
    setLastCheckTime(new Date());
    if (result.logs.length > 0) {
        setLogs(prev => [...result.logs, ...prev].slice(0, 500));
    } else {
        setLogs(prev => [{
            id: Math.random().toString(),
            timestamp: new Date(),
            level: 'info',
            source: 'System',
            message: '周期检查完成：所有 VPS 状态未发生变化'
        }, ...prev]);
    }
  };

  const clearLogs = () => setLogs([]);

  const saveConfig = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "config.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      setLogs(prev => [{
        id: Math.random().toString(),
        timestamp: new Date(),
        level: 'success',
        source: 'System',
        message: '配置文件 config.json 已生成。请上传至服务器 /opt/netcup-guardian/ 目录。'
      }, ...prev]);
  };

  // --- Config Management ---
  const addOverride = () => {
      setConfig(prev => ({
          ...prev,
          overrides: [...prev.overrides, { ip: '', port: prev.qbittorrent.defaultPort }]
      }));
  };

  const removeOverride = (index: number) => {
      setConfig(prev => ({
          ...prev,
          overrides: prev.overrides.filter((_, i) => i !== index)
      }));
  };

  const updateOverride = (index: number, field: keyof VPSOverride, value: any) => {
      const newOverrides = [...config.overrides];
      newOverrides[index] = { ...newOverrides[index], [field]: value };
      setConfig(prev => ({ ...prev, overrides: newOverrides }));
  };

  const addNetcupAccount = () => {
    setConfig(prev => ({
        ...prev,
        netcupAccounts: [...prev.netcupAccounts, { id: Math.random().toString(36).substr(2, 9), loginName: '', password: '' }]
    }));
  };

  const removeNetcupAccount = (index: number) => {
    setConfig(prev => ({
        ...prev,
        netcupAccounts: prev.netcupAccounts.filter((_, i) => i !== index)
    }));
  };

  const updateNetcupAccount = (index: number, field: keyof NetcupAccount, value: string) => {
      const newAccounts = [...config.netcupAccounts];
      newAccounts[index] = { ...newAccounts[index], [field]: value };
      setConfig(prev => ({ ...prev, netcupAccounts: newAccounts }));
  };

  // --- Render Views ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
               监控概览
               {isMonitoring && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span></span>}
            </h1>
            <p className="text-slate-400 text-sm">
                当前纳管 {vpsList.length} 台 Netcup 服务器 (Web端为模拟演示，请部署 Python 脚本以运行实盘)
                {lastCheckTime && <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded text-slate-500">上次更新: {lastCheckTime.toLocaleTimeString()}</span>}
            </p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={handleManualCheck}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-slate-300 rounded-lg transition-all text-sm font-medium active:scale-95"
             >
                <RefreshCw size={16} /> 立即检测(模拟)
             </button>
             <button 
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all shadow-lg text-sm font-bold active:scale-95 ${
                    isMonitoring 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
             >
                <Power size={16} /> {isMonitoring ? '监控运行中' : '启动监控'}
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {vpsList.map(vps => (
          <StatsCard key={vps.id} vps={vps} />
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">系统配置</h1>
            <p className="text-slate-400">配置完成后请下载 config.json 并上传到服务器。</p>
        </div>
        <button 
            onClick={saveConfig}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
        >
            <Download size={18} /> 保存配置 (JSON)
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Netcup Settings */}
        <section className="bg-surface border border-slate-700 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <AlertTriangle size={100} />
            </div>
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xl font-semibold text-accent flex items-center gap-2">
                    <div className="w-1 h-6 bg-accent rounded-full"></div> Netcup SCP 账号列表
                </h2>
                <button 
                    onClick={addNetcupAccount}
                    className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-accent/20 hover:text-accent border border-slate-600 rounded px-3 py-1.5 transition-colors"
                >
                    <Plus size={14} /> 添加账号
                </button>
            </div>
            
            <div className="space-y-3 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {config.netcupAccounts.map((account, index) => (
                    <div key={account.id || index} className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg group hover:border-accent/30 transition-all">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                                <Users size={12} /> 账号 #{index + 1}
                             </span>
                             {config.netcupAccounts.length > 1 && (
                                <button 
                                    onClick={() => removeNetcupAccount(index)}
                                    className="text-slate-500 hover:text-danger p-1 rounded transition-colors"
                                    title="删除此账号"
                                >
                                    <Trash2 size={14} />
                                </button>
                             )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">客户号 (Login Name)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-slate-500" size={14} />
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                        value={account.loginName}
                                        onChange={(e) => updateNetcupAccount(index, 'loginName', e.target.value)}
                                        placeholder="123456"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">密码 (Password)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-slate-500" size={14} />
                                    <input 
                                        type="password" 
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                        value={account.password}
                                        onChange={(e) => updateNetcupAccount(index, 'password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
                <Info size={12} /> 支持添加多个 Netcup 账号。脚本会遍历所有账号下的 VPS。
            </p>
        </section>

        <div className="space-y-6">
            {/* Vertex Settings */}
            <section className="bg-surface border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-success mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-success rounded-full"></div> Vertex 联动配置
                </h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Vertex 地址</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all"
                            value={config.vertex.apiUrl}
                            onChange={(e) => setConfig({...config, vertex: {...config.vertex, apiUrl: e.target.value}})}
                            placeholder="http://127.0.0.1:3000"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">API Key</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all"
                            value={config.vertex.apiKey}
                            onChange={(e) => setConfig({...config, vertex: {...config.vertex, apiKey: e.target.value}})}
                        />
                    </div>
                    <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success/90 flex items-start gap-2">
                        <Info size={16} className="mt-0.5 shrink-0" />
                        <p>
                            系统会自动拉取 Vertex 的所有下载器配置，并通过 IP 地址自动匹配 Netcup VPS。
                            <br />无需手动填写 Vertex ID，只需确保 Vertex 内的下载器地址（Host/IP）与 Netcup VPS IP 一致。
                        </p>
                    </div>
                </div>
            </section>

            {/* Telegram Settings */}
            <section className="bg-surface border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-sky-400 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-sky-400 rounded-full"></div> Telegram 通知
                </h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Bot Token</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-slate-500" size={14} />
                            <input 
                                type="password" 
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                                value={config.telegram.botToken}
                                onChange={(e) => setConfig({...config, telegram: {...config.telegram, botToken: e.target.value}})}
                                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Chat ID</label>
                        <div className="relative">
                            <Send className="absolute left-3 top-2.5 text-slate-500" size={14} />
                            <input 
                                type="text" 
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                                value={config.telegram.chatId}
                                onChange={(e) => setConfig({...config, telegram: {...config.telegram, chatId: e.target.value}})}
                                placeholder="-100123456789"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Bell size={12} /> 限速状态变更或出错时发送通知。
                    </p>
                </div>
            </section>
        </div>

        {/* qBittorrent & Automation */}
        <section className="bg-surface border border-slate-700 rounded-xl p-6 xl:col-span-2">
             <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div> qBittorrent 全局设置 & 策略
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-300">默认端口</label>
                    <input 
                        type="number" 
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        value={config.qbittorrent.defaultPort}
                        onChange={(e) => setConfig({...config, qbittorrent: {...config.qbittorrent, defaultPort: parseInt(e.target.value)}})}
                        placeholder="9090"
                    />
                </div>
                <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-300">默认用户名</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        value={config.qbittorrent.username}
                        onChange={(e) => setConfig({...config, qbittorrent: {...config.qbittorrent, username: e.target.value}})}
                    />
                </div>
                <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-300">默认密码</label>
                    <input 
                        type="password" 
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        value={config.qbittorrent.password}
                        onChange={(e) => setConfig({...config, qbittorrent: {...config.qbittorrent, password: e.target.value}})}
                    />
                </div>
                <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-300">限速时操作</label>
                    <select 
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-warning focus:ring-1 focus:ring-warning transition-all"
                        value={config.monitoring.actionOnThrottle}
                        onChange={(e) => setConfig({...config, monitoring: {...config.monitoring, actionOnThrottle: e.target.value as any}})}
                    >
                        <option value="pause">暂停下载</option>
                        <option value="delete">删除种子</option>
                    </select>
                </div>
            </div>
            
            <div className="mt-6 border-t border-slate-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-200 flex items-center gap-2">
                        <Server size={18} className="text-warning" />
                        特殊服务器配置 (例外)
                     </h3>
                     <button onClick={addOverride} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-600 flex items-center gap-1 transition-colors">
                        <Plus size={12} /> 添加特例
                     </button>
                </div>
                
                {config.overrides.length === 0 ? (
                    <div className="text-center py-4 bg-slate-900/30 rounded border border-dashed border-slate-700 text-slate-500 text-sm">
                        所有服务器均使用默认端口 ({config.qbittorrent.defaultPort}) 和账号密码
                    </div>
                ) : (
                    <div className="space-y-2">
                        {config.overrides.map((override, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-slate-900/50 p-3 rounded border border-slate-700">
                                <input 
                                    type="text" placeholder="VPS IP 地址"
                                    className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white w-full md:w-40"
                                    value={override.ip}
                                    onChange={(e) => updateOverride(index, 'ip', e.target.value)}
                                />
                                <input 
                                    type="number" placeholder="特殊端口"
                                    className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white w-24"
                                    value={override.port || ''}
                                    onChange={(e) => updateOverride(index, 'port', parseInt(e.target.value))}
                                />
                                <input 
                                    type="text" placeholder="特殊用户名 (选填)"
                                    className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white flex-1"
                                    value={override.username || ''}
                                    onChange={(e) => updateOverride(index, 'username', e.target.value)}
                                />
                                <input 
                                    type="text" placeholder="特殊密码 (选填)"
                                    className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white flex-1"
                                    value={override.password || ''}
                                    onChange={(e) => updateOverride(index, 'password', e.target.value)}
                                />
                                <button onClick={() => removeOverride(index)} className="text-slate-500 hover:text-danger p-1">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                 <p className="text-xs text-slate-500 mt-2">
                    * 仅当某台机器的 qBittorrent 端口或账号密码与全局设置不同时，才需要在此处添加。
                </p>
            </div>
        </section>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3">
             <div className="bg-slate-700 p-2 rounded-lg">
                <Terminal size={20} className="text-white" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white">运行日志</h1>
                <p className="text-xs text-slate-400">以下日志仅为浏览器模拟演示，真实日志请在服务器上查看。</p>
             </div>
        </div>
        <button 
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-danger/10 hover:border-danger/50 hover:text-danger text-slate-400 rounded-lg border border-slate-600 transition-colors text-sm"
        >
            <Trash2 size={16} /> 清空日志
        </button>
      </div>

      <div className="flex-1 bg-[#0c0c0c] rounded-xl border border-slate-800 p-4 overflow-hidden flex flex-col shadow-inner font-mono text-sm relative">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#0c0c0c] to-transparent pointer-events-none z-10"></div>
        <div className="overflow-y-auto flex-1 space-y-1.5 pr-2 custom-scrollbar">
            {logs.length === 0 && <div className="text-slate-600 italic text-center mt-20">暂无日志数据</div>}
            {logs.map((log) => (
                <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1.5 rounded transition-colors items-start border-l-2 border-transparent hover:border-slate-600">
                    <span className="text-slate-500 shrink-0 text-xs mt-0.5">[{log.timestamp.toLocaleTimeString()}]</span>
                    <span className={`font-bold uppercase w-16 shrink-0 text-xs mt-0.5 flex items-center gap-1 ${
                        log.level === 'error' ? 'text-danger' : 
                        log.level === 'warning' ? 'text-warning' : 
                        log.level === 'success' ? 'text-success' : 
                        'text-blue-400'
                    }`}>
                        {log.level === 'success' && <CheckCircle size={10} />}
                        {log.level === 'warning' && <AlertTriangle size={10} />}
                        {log.level}
                    </span>
                    <span className="text-slate-400 w-24 shrink-0 text-xs mt-0.5">[{log.source}]</span>
                    <span className="text-slate-300 break-all">{log.message}</span>
                </div>
            ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0c0c0c] to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === Tab.DASHBOARD && renderDashboard()}
      {activeTab === Tab.SETTINGS && renderSettings()}
      {activeTab === Tab.LOGS && renderLogs()}
    </Layout>
  );
};

export default App;