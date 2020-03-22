'use strict';

const Domain = require('domain');
const d = Domain.create();

process.once('unhandledRejection', (r, p) => {
  console.log(p.domain);  // on versions 9, 10, 11, p.domain is defined, on version 12, it is *undefined*
});

d.once('error', () => {
  console.log('domain caught');
});


d.run(() => {
  Promise.resolve(null).then(() => {
    throw new Error('foo');
  });
});
