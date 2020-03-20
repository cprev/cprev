'use strict';

import log from "bunion";
import * as c from '../constants';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

import {app} from "./app";
import {tcpServer} from "./tcp-server";


const tcps = tcpServer.listen(c.tcpServerPort, () => {
  log.info('tcp server listening on port:', c.tcpServerPort);
});

tcps.on('error', e => {
  log.warn('tcp server error:',e);
});


const s = app.listen(c.httpServerPort, () => {
  log.info('server listening on port:', c.httpServerPort);
});

process.once('SIGTERM', () => {

  setTimeout(() => {
    log.warn('server close timed out.');
    process.exit(1);
  }, 2000);

  s.close(() => {
    process.exit(1)
  });
});

process.once('SIGINT', () => {

  setTimeout(() => {
    log.warn('server close timed out.');
    process.exit(1);
  }, 2000);

  s.close(() => {
    process.exit(1)
  });

});

s.on('error', e => {
  console.error('server error:', e);
});


process.on('unhandledRejection', p => {
  console.error('unhandled rejection:',p);
});

process.on('uncaughtException', p => {
  console.error('uncaught exception:',p);
});
