'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const bunion_1 = require("bunion");
const c = require("../constants");
if (require.main === module) {
    bunion_1.default.error('8224ed20-4d86-471f-9dae-e51d37b82cc8:', 'cannot run the agent.js file directly - use main.js.');
    process.exit(1);
}
const cache = {
    conn: null
};
exports.getConnection = () => {
    return new Promise((resolve => {
        if (cache.conn && cache.conn.writable) {
            return resolve(cache.conn);
        }
    }));
};
const makeNewConnection = () => {
    if (cache.conn) {
        cache.conn.removeAllListeners();
        cache.conn.destroy();
    }
    const conn = cache.conn = net.createConnection({
        port: c.tcpServerPort,
        host: c.tcpServerHost
    });
    conn.once('connect', () => {
        bunion_1.default.info('agent connected to server via tcp:', c.httpServerHost, c.httpServerPort);
    });
    conn.once('error', e => {
        bunion_1.default.error('0996b105-0a2d-4fa6-a67d-ff7853ff0133:', 'socket conn error: ', e);
        conn.removeAllListeners();
        setTimeout(() => {
            makeNewConnection();
        }, 2000);
    });
    conn.once('disconnect', () => {
        conn.removeAllListeners();
        bunion_1.default.info('996d5da1-1a73-40d7-a38d-043f13c8a5f1:', 'connection disconnected.');
        setTimeout(() => {
            makeNewConnection();
        }, 10);
    });
    conn.once('end', () => {
        conn.removeAllListeners();
        bunion_1.default.info('d63a8250-a062-4117-bc2e-1f2d39295328:', 'connection ended.');
        setTimeout(() => {
            makeNewConnection();
        }, 10);
    });
    return conn;
};
cache.conn = makeNewConnection();
