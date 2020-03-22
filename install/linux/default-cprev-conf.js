'use strict';


exports.default = {

  userId: `{{userId}}`,
  machineId: `{{machineId}}`,
  delayOnChange: 2500,
  ignoreFiles: [],
  codeRoots: [
    `${process.env.HOME}/codes`,
    `${process.env.HOME}/go/src/github.com/channelmeter`
  ]
};
