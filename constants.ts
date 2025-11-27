
import { AppConfig, VPS } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  netcupAccounts: [
      { id: '1', loginName: '', password: '' }
  ],
  vertex: {
    apiUrl: 'http://vertex-app:3000',
    apiKey: '',
  },
  qbittorrent: {
    defaultPort: 9090,
    username: 'admin',
    password: 'adminadmin',
  },
  monitoring: {
    intervalSeconds: 300, // 5 minutes default
    actionOnThrottle: 'pause',
    logRetentionDays: 7,
  },
  telegram: {
    botToken: '',
    chatId: ''
  },
  overrides: []
};

// Generate 10 Mock VPS instances as requested
export const MOCK_VPS_LIST: VPS[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `vps-${i + 1}`,
  name: `Netcup-VPS-${1000 + i}`,
  ip: `185.20.${i + 10}.${i + 50}`,
  isThrottled: false,
  lastChecked: new Date(),
  qbPort: 9090,
  linkedDownloaderId: `61c9a06${i}`,
  linkedDownloaderAlias: `NC-VPS-${i + 1}-320G`,
  statusMessage: '正常运行'
}));
