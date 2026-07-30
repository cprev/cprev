'use strict';

const randomUuid = require('../random-uuid');
const fs = require('fs');
const path = require('path');

const p = path.resolve(__dirname + '/default-cprev-conf.js');
const conf = fs.readFileSync(p, 'utf8');

const s = conf
  .replace('{{machineUuid}}', randomUuid())
  .replace('{{userUuid}}', randomUuid());

const confPath = path.resolve(process.env.HOME + '/.cprev/conf/cprev.conf.js');
fs.writeFileSync(confPath, s);
fs.chmodSync(confPath, '444');
