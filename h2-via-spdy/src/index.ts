import {ApplicationConfig, H2ViaSpdyApplication} from './application';

export * from './application';

import fs from 'fs';
import path from 'path';
import spdy from 'spdy';

export async function main(options: ApplicationConfig = {}) {
  // specify cert and key file paths for SSL
  const serverOptions: spdy.ServerOptions = {
    key: fs.readFileSync(
      path.join(__dirname, '..', '..', 'keys', 'localhost-privkey.pem'),
    ),
    cert: fs.readFileSync(
      path.join(__dirname, '..', '..', 'keys', 'localhost-cert.pem'),
    ),
  };

  // setting listenOnStart to false will not start the default httpServer
  options.rest.listenOnStart = false;

  // Replace YourApplication with your class
  const app = new H2ViaSpdyApplication(options);
  await app.boot();
  await app.start();

  // create server
  const server = spdy.createServer(serverOptions, app.requestHandler);

  // to avoid process exit on warnings
  server.on('warning', console.warn);

  server.listen(options.rest.port, () => {
    console.log('Listening on https://localhost:options.rest.port/');
  });

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 4004),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
