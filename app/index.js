global.fetch = require('node-fetch');

if (typeof logger === 'undefined') {
  global.logger = console;
  const { info } = logger;
  logger.info = (...args) => info(Date.now(), ...args);
}

class App {
  async allowInsecure(use) {
    if (use === false) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  fetchEnv() {
    const Host = 'https://partner.credentials.svc.cluster.local';
    const Cookie = 'X-AUTH=X0X0X0X0X0X0X0X';
    const pattern = [/=/g, '', 'base64'];
    const request = [
      `${Host}/env.json`,
      { method: 'GET', headers: { Cookie } },
    ];
    return this.allowInsecure()
    .then(() => fetch(...request))
    .then(res => this.allowInsecure(false) && res)
    .then(res => res.json())
    .then(json => JSON.parse(
      Buffer.from(json.env.replace(...pattern), pattern[2]).toString(),
    ).valueDomain);
  }

  fetchIP() {
    return fetch('https://inet-ip.info/ip')
    .then(res => res.text())
    .then(res => res.split('\n')[0]);
  }

  getData() {
    return Promise.all([
      this.fetchIP(),
      this.fetchEnv(),
    ]);
  }

  waiter(milliseconds) {
    const prom = {};
    prom.pending = new Promise((...args) => [prom.resolve, prom.reject] = args);
    setTimeout(prom.resolve, milliseconds);
    return prom.pending;
  }

  async setAddress(ip, env) {
    logger.info('Dynamic DNS polling.');
    const { domain, token } = env;
    for (const host of env.hosts) {
      const params = { domain, token, host, ip, retry: 10 };
      await this.dynamic(params)
      .catch(e => logger.error({ message: e.toString() }));
    }
    return 'OK';
  }

  dynamic({ domain, token, host, ip, retry }) {
    const path = 'https://dyn.value-domain.com/cgi-bin/dyn.fcg';
    const url = `${path}?d=${domain}&p=${token}&h=${host}&i=${ip}`;
    return fetch(url, { method: 'GET' })
    .then(res => res.text())
    .then(text => {
      const status = text.replace(/[\s]+/g, ' ').trim();
      return { updated: `${ip} - ${status} - ${host}.${domain}`, status };
    })
    .then(res => {
      logger.info(JSON.stringify(res));
      if (res.status === 'status=0 OK' || !retry) return res;
      return this.waiter(2200)
      .then(() => this.dynamic({ domain, token, host, ip, retry: retry - 1 }));
    });
  }

  main() {
    return this.getData()
    .then(data => this.setAddress(...data));
  }

  start() {
    this.main()
    .catch(e => logger.error({ message: e.toString() }));
  }
}

new App().start();
