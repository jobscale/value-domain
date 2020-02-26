global.fetch = require('node-fetch');

global.logger = console;
const app = {
  url: 'https://dyn.value-domain.com/cgi-bin/dyn.fcg',
  fetchEnv() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    const pattern = [/=/g, '', 'base64'];
    return fetch('https://partner/env.json', {
      method: 'GET',
      headers: { Cookie: 'X-AUTH=X0X0X0X0X0X0X0X' },
    })
    .then(res => res.json())
    .then(res => JSON.parse(
      Buffer.from(res.env.replace(...pattern), pattern[2]).toString(),
    ).valueDomain);
  },
  fetchIP() {
    return fetch('http://inet-ip.info/ip')
    .then(res => res.text())
    .then(res => res.split('\n')[0]);
  },
  getData() {
    return Promise.all([
      this.fetchIP(),
      this.fetchEnv(),
    ]);
  },
  async setAddress(ip, env) {
    for (const host of env.hosts) {
      await fetch(`${app.url}?d=${env.domain}&p=${env.token}&h=${host}&i=${ip}`, {
        method: 'GET',
      })
      .then(logger.info);
    }
    return 'OK';
  },
  main() {
    return app.getData()
    .then(data => app.setAddress(...data));
  },
  start() {
    app.main()
    .catch(logger.error);
  },
};
app.start();
