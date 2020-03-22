'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const json_stream_parser_1 = require("@oresoftware/json-stream-parser");
const on_change_1 = require("./on-change");
const on_read_1 = require("./on-read");
const bunion_1 = require("bunion");
const uuid = require("uuid");
if (require.main === module) {
    bunion_1.default.error('757b18f0-9a5e-481b-91a8-9dee60df4ac0:', 'cannot run the file directly - use main.js.');
    process.exit(1);
}
exports.connections = new Set();
const doWrite = (s, resUuid, v) => {
    if (!s.writable) {
        bunion_1.default.warn('bae5c25d-60c6-4dd5-91af-d993142199ae: socket is not writable.');
        return;
    }
    bunion_1.default.info("5897e002-6690-42b3-8fa3-fa5ec7929541 writing payload:", v);
    v.resUuid = resUuid || null;
    s.write(JSON.stringify(v) + '\n', 'utf8');
};
exports.tcpServer = net.createServer(s => {
    exports.connections.add(s);
    s.once('error', e => {
        bunion_1.default.error('6f955362-4aec-4841-ba57-c98cd30cd2b5:', 'socket conn error: ', e);
        exports.connections.delete(s);
    });
    s.once('disconnect', () => {
        bunion_1.default.info('6f955362-4aec-4841-ba57-c98cd30cd2b5:', 'connection disconnected.');
        exports.connections.delete(s);
    });
    s.once('end', () => {
        bunion_1.default.info('c25f6ed5-a3c6-494e-9493-c2a945bac335:', 'connection ended.');
        exports.connections.delete(s);
    });
    s.pipe(new json_stream_parser_1.default()).on('data', (d) => {
        const reqId = d.reqUuid || null;
        if (!(d.val && d.val.repo && typeof d.val.repo === 'string')) {
            return doWrite(s, reqId, {
                error: 'missing repo',
                reqUuid: uuid.v4()
            });
        }
        if (d.type === 'change') {
            return on_change_1.onChange(d.val, v => {
                doWrite(s, reqId, v);
            });
        }
        if (d.type === 'read') {
            return on_read_1.onRead(d.val, v => {
                doWrite(s, reqId, v);
            });
        }
        bunion_1.default.error('e0a00403-74b0-4fc9-bf94-a305bef71c68: no task matched type:', d.type);
        doWrite(s, reqId, {
            errId: 'd2fd1c06-66c4-4b74-b56a-e11eac1a85ce',
            reqUuid: uuid.v4(),
            error: `no task matched type: '${d.type}'`
        });
    });
});
