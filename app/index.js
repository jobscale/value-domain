const { logger } = require('@jobscale/logger');

const { ENV } = process.env;

const CIA = {
  dev: 'ICAKeyJkb21haW4iOiJqc3guanAiLCJ1cmwiOiJodHRwczovL2R5bi52YWx1ZS1kb21haW4uY29tL2NnaS1iaW4vZHluLmZjZyIsInRva2VuIjoib21vaWNvbWkiLCJob3N0cyI6WyJhc2lhIl19',
  prod: 'IAp7ImRvbWFpbiI6ImpzeC5qcCIsInVybCI6Imh0dHBzOi8vZHluLnZhbHVlLWRvbWFpbi5jb20vY2dpLWJpbi9keW4uZmNnIiwidG9rZW4iOiJvbW9pY29taSIsImhvc3RzIjpbInVzIl19',
}[ENV] || {};

class App {
  async allowInsecure(use) {
    if (use === false) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  fetchEnv() {
    const Host = 'https://partner.credentials.svc.cluster.local';
    const Cookie = 'X-AUTH=X0X0X0X0X0X0X0X';
    const request = [
      `${Host}/value-domain.env.json`,
      { method: 'GET', headers: { Cookie } },
    ];
    return this.allowInsecure()
    .then(() => fetch(...request))
    .then(res => this.allowInsecure(false) && res)
    .then(res => res.json())
    .catch(() => JSON.parse(Buffer.from(CIA, 'base64').toString()));
  }

  fetchIP() {
    return fetch('https://inet-ip.info/ip')
    .then(res => res.text())
    .then(res => res.split('\n')[0]);
  }

  waiter(milliseconds) {
    return new Promise(
      resolve => { setTimeout(resolve, milliseconds); },
    );
  }

  async setAddress(ip, env) {
    logger.info(`Dynamic DNS polling. - ${ENV}`);
    const { domain, url, token } = env;
    for (const host of env.hosts) {
      await this.dynamic({
        domain, url, token, host, ip, retry: 3,
      })
      .catch(e => logger.error({ message: e.toString() }));
    }
    return 'ok';
  }

  dynamic({ domain, url, token, host, ip, retry }) {
    const path = `${url}?d=${domain}&p=${token}&h=${host}&i=${ip}`;
    return fetch(path, { method: 'GET' })
    .then(res => res.text())
    .then(text => {
      const status = text.replace(/[\s]+/g, ' ').trim();
      return { updated: `${ip} - ${status} - ${host}.${domain}`, status };
    })
    .then(res => {
      logger.info(JSON.stringify(res));
      if (res.status === 'status=0 OK' || !retry) return res;
      return this.waiter(6600)
      .then(() => this.dynamic({
        domain, url, token, host, ip, retry: retry - 1,
      }));
    });
  }

  main() {
    return Promise.all([this.fetchIP(), this.fetchEnv()])
    .then(data => this.setAddress(...data));
  }

  start() {
    const ts = new Date();
    logger.info({ ts: ts.getTime(), now: ts.toISOString() });
    this.main()
    .catch(e => logger.error({ message: e.toString() }));
  }
}

new App().start();
