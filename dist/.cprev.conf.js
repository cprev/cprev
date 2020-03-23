'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const userUuid = process.env.cprev_user_uuid || '';
if (!userUuid) {
    console.error('missing env var: cprev_user_uuid..');
    process.exit(1);
}
exports.default = {
    userUuid,
    codeRoots: [
        `${process.env.HOME}/codes`,
        `${process.env.HOME}/go/src/github.com/channelmeter`
    ]
};
