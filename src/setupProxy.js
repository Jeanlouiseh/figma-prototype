const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy for iTwin.js Sandbox to allow seamless embedding in iframes
  app.use(
    '/itwin-sandbox',
    createProxyMiddleware({
      target: 'https://www.itwinjs.org',
      changeOrigin: true,
      pathRewrite: {
        '^/itwin-sandbox': '/sandbox/RoopSaini/first-itwin',
      },
      onProxyRes: function (proxyRes) {
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        proxyRes.headers['access-control-allow-origin'] = '*';
      },
    })
  );

  // Proxy for sandbox static assets
  app.use(
    '/sandbox',
    createProxyMiddleware({
      target: 'https://www.itwinjs.org',
      changeOrigin: true,
      onProxyRes: function (proxyRes) {
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        proxyRes.headers['access-control-allow-origin'] = '*';
      },
    })
  );
};
