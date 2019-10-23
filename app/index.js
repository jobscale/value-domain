const { spawn } = require('child_process');
const env = require('./env');
global.fetch = require('node-fetch');

global.logger = console;
const app = {
  url: 'https://dyn.value-domain.com/cgi-bin/dyn.fcg',
  headers: {
    accept: ['text/html',
      'application/xhtml+xml',
      'application/xml;q=0.9',
      'image/webp',
      'image/apng',
      '*/*;q=0.8',
      'application/signed-exchange;v=b3',
    ].join(','),
    'accept-language': 'ja,en-US;q=0.9,en;q=0.8',
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
  },
  getAddress() {
    return new Promise((resolve, reject) => {
      const proc = spawn('curl', ['ifconfig.io'], { shell: true });
      proc.stdout.on('data', data => resolve(data.toString()));
      const close = code => code ? reject(new Error('NG')) : resolve('OK');
      proc.on('close', code => setTimeout(close, 1000, code));
    });
  },
  async setAddress(ip) {
    for (const host of env.hosts) {
      await fetch(`${app.url}?d=${env.domain}&p=${env.token}&h=${host}&i=${ip}`, {
        credentials: 'include',
        headers: app.headers,
        referrer: 'https://dyn.value-domain.com/cgi-bin/dyn.fcg?',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: null,
        method: 'GET',
        mode: 'cors',
      })
      .then(logger.info);
    }
    return 'OK';
  },
  main() {
    return app.getAddress()
    .then(ip => app.setAddress(ip));
  },
  start() {
    app.main()
    .catch(logger.error);
  },
};
app.start();
