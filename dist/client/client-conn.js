'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = void 0;
const net = require("net");
const c = require("../constants");
const bunion_1 = require("bunion");
const agent_1 = require("./agent");
const json_stream_parser_1 = require("@oresoftware/json-stream-parser");
const notifier = require("node-notifier");
const _cprev_conf_1 = require("../.cprev.conf");
exports.getConnection = () => {
    return new Promise((resolve => {
        if (agent_1.cache.conn && agent_1.cache.conn.writable) {
            return resolve(agent_1.cache.conn);
        }
        makeNewConnection().once('connect', () => {
            resolve(agent_1.cache.conn);
        });
    }));
};
const makeNewConnection = () => {
    if (agent_1.cache.conn) {
        agent_1.cache.conn.removeAllListeners();
        agent_1.cache.conn.destroy();
    }
    const conn = agent_1.cache.conn = net.createConnection({
        port: c.tcpServerPort,
        host: c.tcpServerHost
    });
    conn.pipe(new json_stream_parser_1.default()).on('data', d => {
        bunion_1.default.info(`client conn (for user id: '${_cprev_conf_1.default.userUuid}') received data:`, d);
        if (!(d && typeof d === 'object')) {
            bunion_1.default.warn('response data is not an object.');
            return;
        }
        if (agent_1.cache.resolutions.has(d.resUuid)) {
            return agent_1.cache.resolutions.get(d.resUuid)(d);
        }
        if (d.result === 'error') {
            bunion_1.default.warn('error value in the received message:', d);
            return;
        }
        if (d.result === 'conflict') {
            return notifier.notify({
                title: 'There are conflicts!',
                message: 'There were conflicts!',
            }, function (err, response) {
                console.error('resp:', err, response);
            });
        }
    });
    conn.once('connect', () => {
        bunion_1.default.info('agent connected to server via tcp:', c.httpServerHost, c.httpServerPort);
    });
    conn.once('error', e => {
        bunion_1.default.error('0996b105-0a2d-4fa6-a67d-ff7853ff0133:', 'socket conn error: ', e);
        conn.removeAllListeners();
        setTimeout(() => {
            makeNewConnection();
        }, 9000);
    });
    conn.once('disconnect', () => {
        conn.removeAllListeners();
        bunion_1.default.info('996d5da1-1a73-40d7-a38d-043f13c8a5f1:', 'connection disconnected.');
        setTimeout(() => {
            makeNewConnection();
        }, 300);
    });
    conn.once('end', () => {
        conn.removeAllListeners();
        bunion_1.default.info('d63a8250-a062-4117-bc2e-1f2d39295328:', 'connection ended.');
        setTimeout(() => {
            makeNewConnection();
        }, 300);
    });
    return conn;
};
agent_1.cache.conn = makeNewConnection();
