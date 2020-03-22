'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const bunion_1 = require("bunion");
const json_stream_parser_1 = require("@oresoftware/json-stream-parser");
const doWrite = (s, v) => {
    if (!s.writable) {
        bunion_1.default.warn('3d6e661f-2c6f-4e6e-adeb-0c9729fc2df6: socket is not writable.');
        return;
    }
    bunion_1.default.info("376aa75b-854e-4b67-99d7-55efafe8f7f3 writing payload:", v);
    s.write(JSON.stringify({ val: v }) + '\n', 'utf8');
};
exports.connections = new Set();
exports.agentTcpServer = net.createServer(s => {
    exports.connections.add(s);
    s.once('error', e => {
        bunion_1.default.error('08e3add4-b9ec-418e-b255-d0afd0a2ec50:', 'socket conn error: ', e);
        s.removeAllListeners();
        exports.connections.delete(s);
    });
    s.once('disconnect', () => {
        bunion_1.default.info('19588471-b830-4f99-bfa0-0048cd3a905d:', 'connection disconnected.');
        exports.connections.delete(s);
    });
    s.once('end', () => {
        bunion_1.default.info('cc06fa58-519f-4743-b211-c826bd085b58:', 'connection ended.');
        exports.connections.delete(s);
    });
    s.pipe(new json_stream_parser_1.default()).on('data', (d) => {
        if (!(d.val && d.val.repo && typeof d.val.repo === 'string')) {
            return doWrite(s, { error: 'missing repo' });
        }
        bunion_1.default.error('8fe8e800-1525-4870-930b-2eeec3c42fbd: no task matched type:', d.type);
        doWrite(s, {
            error: `fc892414-4e91-456c-a6ef-55ef1bfcc92c: no task matched type: '${d.type}'`
        });
    });
});
