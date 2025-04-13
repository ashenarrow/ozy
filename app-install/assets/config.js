// OZYRIX System Configuration
const OZYRIX_CONFIG = {
  version: '3.0.0',
  codename: 'PHANTOM',
  theme: 'hacker',
  serverPort: 3000,
  sessionSecret: 'ozyrix-secure-session-key',
  terminal: {
    defaultPrompt: 'user@ozyrix:~$',
    fontSize: 14,
    maxHistoryLength: 100,
    enableMatrixEffect: true,
    enableScreenShake: true
  },
  proxy: {
    enabled: true,
    defaultServer: 'https://cors-anywhere.herokuapp.com/',
    fallbackServer: 'https://api.allorigins.win/raw?url='
  },
  ui: {
    animations: true,
    sounds: true,
    notifications: true,
    showServerStatus: true
  },
  categories: [
    { id: 'app', name: 'Apps', icon: 'app' },
    { id: 'game', name: 'Games', icon: 'game' },
    { id: 'exploit', name: 'Exploits', icon: 'exploit' },
    { id: 'utility', name: 'Utilities', icon: 'utility' }
  ],
  bios: {
    enabled: true,
    keyCombo: ['F', 'B'],
    password: '',
    bootDelay: 2000
  },
  paths: {
    uploads: '/uploads',
    apps: '/assets/apps',
    images: '/assets/images'
  }
};

if (typeof window !== 'undefined') {
  window.OZYRIX_CONFIG = OZYRIX_CONFIG;
}
