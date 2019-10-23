global.fetch = require('node-fetch');
const env = require('./env');

global.logger = console;
const app = {
  url: 'https://dyn.value-domain.com/cgi-bin/dyn.fcg',
  headers: {
  },
  fetchIP() {
    return fetch('http://ifconfig.io/ip')
    .then(res => res.text())
    .then(res => res.split('\n')[0]);
  },
  async setAddress(ip) {
    logger.log({ net: { ip } });
    for (const host of env.hosts) {
      await fetch(`${app.url}?d=${env.domain}&p=${env.token}&h=${host}&i=${ip}`, {
        headers: app.headers,
        method: 'GET',
      })
      .then(logger.info);
    }
    return 'OK';
  },
  main() {
    return app.fetchIP()
    .then(ip => app.setAddress(ip));
  },
  start() {
    app.main()
    .catch(logger.error);
  },
};
app.start();
