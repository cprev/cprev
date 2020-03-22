'use strict';


exports.default = {
  username: process.env.USER,
  userUuid: `{{userUuid}}`,
  machineUuid: `{{machineUuid}}`,
  delayOnChange: 2500,
  ignoreFiles: [],
  ignoreRegex: [

  ],
  hostname: process.env.HOSTNAME,
  codeRoots: [
    `${process.env.HOME}/codes`,
    `${process.env.HOME}/go/src/github.com/channelmeter`
  ]
};
