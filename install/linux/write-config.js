'use strict';

const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

const p = path.resolve(__dirname + '/default-cprev-conf.js');
const conf = fs.readFileSync(p, 'utf8');

const s = conf
  .replace('{{machineUuid}}', uuid.v4())
  .replace('{{userUuid}}', uuid.v4());

const confPath = path.resolve(process.env.HOME + '/.cprev/conf/cprev.conf.js');
fs.writeFileSync(confPath, s);
fs.chmodSync(confPath, '444');
