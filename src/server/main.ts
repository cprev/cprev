'use strict';

import log from "bunion";
import * as c from '../constants';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

import {app} from "./app";
import {tcpServer} from "./tcp-server";


const tcps = tcpServer.listen(c.tcpServerPort, c.tcpServerHost, () => {
  log.info('tcp server listening on port:', c.tcpServerPort);
});

tcps.on('error', e => {
  log.warn('eb801985-e0bd-41e3-880b-fa9a8a75b4db: tcp server error:',e);
});


const s = app.listen(c.httpServerPort, '0.0.0.0',() => {
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
  log.error('server error:', e);
});


process.on('unhandledRejection', p => {
  log.error('3c2d3ed6-d774-4cbf-8484-26269f08a98a:', 'unhandled rejection:',p);
});

process.on('uncaughtException', p => {
  log.error('357afd36-5180-49d0-b626-b592273329f2:', 'uncaught exception:',p);
});
