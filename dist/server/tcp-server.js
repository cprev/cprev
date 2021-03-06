'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.tcpServer = exports.socketToUserUuid = exports.connectionsByUserUuid = exports.connections = void 0;
const net = require("net");
const json_stream_parser_1 = require("@oresoftware/json-stream-parser");
const on_change_1 = require("./on-change");
const on_read_1 = require("./on-read");
const bunion_1 = require("bunion");
const uuid = require("uuid");
const on_git_change_1 = require("./on-git-change");
if (require.main === module) {
    bunion_1.default.error('757b18f0-9a5e-481b-91a8-9dee60df4ac0:', 'cannot run the file directly - use main.js.');
    process.exit(1);
}
exports.connections = new Set();
const doWrite = (s, originalReqId, userUuid, v) => {
    if (!s.writable) {
        bunion_1.default.warn('bae5c25d-60c6-4dd5-91af-d993142199ae: socket is not writable.');
        return;
    }
    if (!(v && typeof v === 'object')) {
        bunion_1.default.warn('payload is not an object:', v);
        return;
    }
    if (v.resUuid) {
        bunion_1.default.warn('refusing to write to socket since payload has resUuid property:', v);
        return;
    }
    bunion_1.default.info(`5897e002-6690-42b3-8fa3-fa5ec7929541 writing payload to client ('${userUuid}'):`, v);
    v.resUuid = originalReqId || null;
    s.write(JSON.stringify(v) + '\n', 'utf8');
};
exports.connectionsByUserUuid = new Map();
exports.socketToUserUuid = new Map();
const cleanUpConnection = (s) => {
    exports.connections.delete(s);
    const userUuids = exports.socketToUserUuid.get(s);
    if (!userUuids) {
        return;
    }
    exports.socketToUserUuid.delete(s);
    for (const c of userUuids) {
        exports.connectionsByUserUuid.delete(c);
    }
};
exports.tcpServer = net.createServer(s => {
    exports.connections.add(s);
    bunion_1.default.info('db8e1576-91d2-43f6-9285-6ff35d0f864a: new connection.');
    s.once('error', e => {
        bunion_1.default.error('6f955362-4aec-4841-ba57-c98cd30cd2b5:', 'socket conn error: ', e);
        cleanUpConnection(s);
    });
    s.once('disconnect', () => {
        bunion_1.default.info('6f955362-4aec-4841-ba57-c98cd30cd2b5:', 'connection disconnected.');
        cleanUpConnection(s);
    });
    s.once('end', () => {
        bunion_1.default.info('c25f6ed5-a3c6-494e-9493-c2a945bac335:', 'connection ended.');
        cleanUpConnection(s);
    });
    s.pipe(new json_stream_parser_1.default()).on('data', (d) => {
        const reqId = d.reqUuid || null;
        const userUuid = d.userUuid;
        if (!userUuid) {
            return doWrite(s, reqId, null, {
                result: 'error',
                error: 'missing userUuid in request',
                reqUuid: uuid.v4()
            });
        }
        {
            if (!exports.socketToUserUuid.has(s)) {
                exports.socketToUserUuid.set(s, new Set());
            }
            exports.socketToUserUuid.get(s).add(userUuid);
            if (!exports.connectionsByUserUuid.has(userUuid)) {
                exports.connectionsByUserUuid.set(userUuid, new Set());
            }
            exports.connectionsByUserUuid.get(userUuid).add(s);
        }
        if (d.type === 'git') {
            return on_git_change_1.onGitChange(d.val, userUuid, v => {
                doWrite(s, reqId, userUuid, v);
            });
        }
        if (d.type === 'change') {
            return on_change_1.onChange(d.val, userUuid, v => {
                doWrite(s, reqId, userUuid, v);
            });
        }
        if (d.type === 'read') {
            return on_read_1.onRead(d.val, userUuid, v => {
                doWrite(s, reqId, userUuid, v);
            });
        }
        bunion_1.default.error('e0a00403-74b0-4fc9-bf94-a305bef71c68: no task matched type:', d.type);
        doWrite(s, reqId, userUuid, {
            errId: 'd2fd1c06-66c4-4b74-b56a-e11eac1a85ce',
            reqUuid: uuid.v4(),
            error: `no task matched type: '${d.type}'`
        });
    });
});
