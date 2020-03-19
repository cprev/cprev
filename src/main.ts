'use strict';


export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

import {app} from "./app";

const port = 3045;

const s = app.listen(port, () => {
  console.log('server listening on port:', port);
});

process.once('SIGTERM', () => {
  s.close(() => {
    process.exit(1)
  });
});

process.once('SIGINT', () => {
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
