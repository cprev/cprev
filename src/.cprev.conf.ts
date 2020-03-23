'use strict';

const userUuid = process.env.cprev_user_uuid || ''; // '41635BC0-CB38-4D30-974A-A1A9290C5D86'

if(!userUuid){
  console.error('missing env var: cprev_user_uuid..');
  process.exit(1);
}

export default {
  userUuid,
  codeRoots: [
    `${process.env.HOME}/codes`,
    `${process.env.HOME}/go/src/github.com/channelmeter`
  ]
};
