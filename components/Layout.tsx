import React from 'react';
import { ShieldAlert, Settings, LayoutDashboard, Terminal } from 'lucide-react';
import { Tab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-slate-300 font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex-shrink-0 border-r border-slate-700 bg-surface flex flex-col items-center lg:items-stretch transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700">
            <ShieldAlert className="h-8 w-8 text-accent animate-pulse" />
            <span className="hidden lg:block ml-3 font-bold text-xl text-white tracking-wider">Netcup守卫</span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-2 lg:px-4">
          <button
            onClick={() => onTabChange(Tab.DASHBOARD)}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
              activeTab === Tab.DASHBOARD 
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={24} className={activeTab === Tab.DASHBOARD ? "animate-bounce-short" : ""} />
            <span className="hidden lg:block ml-3 font-medium">仪表盘</span>
            {/* Tooltip for mobile */}
            <span className="lg:hidden absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              仪表盘
            </span>
          </button>

          <button
            onClick={() => onTabChange(Tab.SETTINGS)}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
              activeTab === Tab.SETTINGS 
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Settings size={24} className={activeTab === Tab.SETTINGS ? "animate-spin-slow" : ""} />
            <span className="hidden lg:block ml-3 font-medium">系统设置</span>
             <span className="lg:hidden absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              设置
            </span>
          </button>

          <button
            onClick={() => onTabChange(Tab.LOGS)}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
              activeTab === Tab.LOGS 
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal size={24} />
            <span className="hidden lg:block ml-3 font-medium">运行日志</span>
             <span className="lg:hidden absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              日志
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-center lg:text-left text-slate-500">
          <p className="hidden lg:block">Debian 12 专版</p>
          <p>Netcup API v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 custom-scrollbar">
          {children}
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(180deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layout;