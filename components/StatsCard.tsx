
import React from 'react';
import { VPS } from '../types';
import { Server, Zap, ZapOff, Activity, Clock, Globe, Fingerprint } from 'lucide-react';

interface StatsCardProps {
  vps: VPS;
}

const StatsCard: React.FC<StatsCardProps> = ({ vps }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-lg group ${
      vps.isThrottled 
        ? 'bg-danger/5 border-danger/30 hover:border-danger/60 hover:shadow-danger/10' 
        : 'bg-surface border-slate-700 hover:border-slate-500 hover:shadow-primary/5'
    }`}>
      {/* Background Pulse for Throttle */}
      {vps.isThrottled && (
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-danger/20 blur-2xl animate-pulse"></div>
      )}

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg transition-colors ${vps.isThrottled ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary group-hover:bg-primary/30'}`}>
            <Server size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{vps.name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Globe size={10} />
                {vps.ip}
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
          vps.isThrottled 
            ? 'bg-danger/10 text-danger border-danger/20 animate-pulse' 
            : 'bg-success/10 text-success border-success/20'
        }`}>
          <div className={`w-2 h-2 rounded-full ${vps.isThrottled ? 'bg-danger' : 'bg-success'}`}></div>
          {vps.isThrottled ? '已限速' : '正常'}
        </div>
      </div>

      <div className="space-y-3 relative z-10 bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
        {/* Vertex Status */}
        <div className="border-b border-slate-700/50 pb-2 mb-2">
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-slate-500 flex items-center gap-2">
                    <Activity size={14} className="text-accent" /> Vertex 状态
                </span>
                <span className={`font-medium text-xs ${vps.isThrottled ? 'text-slate-500 line-through' : 'text-success'}`}>
                    {vps.isThrottled ? '已禁用推送' : '运行中'}
                </span>
            </div>
            {vps.linkedDownloaderId ? (
                <div className="flex flex-col text-xs pl-6">
                    <span className="text-slate-300 font-medium truncate" title={vps.linkedDownloaderAlias}>{vps.linkedDownloaderAlias || '未命名'}</span>
                    <span className="text-slate-600 font-mono flex items-center gap-1">
                        <Fingerprint size={10} /> {vps.linkedDownloaderId}
                    </span>
                </div>
            ) : (
                <div className="pl-6 text-xs text-slate-600 italic">未匹配到 Vertex 下载器</div>
            )}
        </div>

        {/* qBittorrent Status */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 flex items-center gap-2">
            {vps.isThrottled ? <ZapOff size={14} className="text-danger" /> : <Zap size={14} className="text-yellow-400" />} 
            qBittorrent
          </span>
          <div className="text-right">
             <span className={`block font-medium ${vps.isThrottled ? 'text-danger' : 'text-slate-300'}`}>
                {vps.isThrottled ? '已暂停/删除' : '正常下载'}
             </span>
             <span className="text-[10px] text-slate-600 font-mono">端口: {vps.qbPort}</span>
          </div>
        </div>
      </div>

        <div className="pt-3 flex justify-between items-center text-xs text-slate-500">
           <span className="flex items-center gap-1"><Clock size={12}/> 上次检查</span>
           <span>{vps.lastChecked.toLocaleTimeString()}</span>
        </div>
    </div>
  );
};

export default StatsCard;
