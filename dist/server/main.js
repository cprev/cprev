'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const bunion_1 = require("bunion");
const c = require("../constants");
exports.r2gSmokeTest = function () {
    return true;
};
const app_1 = require("./app");
const tcp_server_1 = require("./tcp-server");
const tcps = tcp_server_1.tcpServer.listen(c.tcpServerPort, c.tcpServerHost, () => {
    bunion_1.default.info('tcp server listening on port:', c.tcpServerPort);
});
tcps.on('error', e => {
    bunion_1.default.warn('eb801985-e0bd-41e3-880b-fa9a8a75b4db: tcp server error:', e);
});
const s = app_1.app.listen(c.httpServerPort, c.httpServerHost, () => {
    bunion_1.default.info('server listening on port:', c.httpServerHost, c.httpServerPort);
});
process.once('SIGTERM', () => {
    setTimeout(() => {
        bunion_1.default.warn('server close timed out.');
        process.exit(1);
    }, 2000);
    s.close(() => {
        process.exit(1);
    });
});
process.once('SIGINT', () => {
    setTimeout(() => {
        bunion_1.default.warn('server close timed out.');
        process.exit(1);
    }, 2000);
    s.close(() => {
        process.exit(1);
    });
});
s.on('error', e => {
    bunion_1.default.error('server error:', e);
});
process.on('unhandledRejection', p => {
    bunion_1.default.error('3c2d3ed6-d774-4cbf-8484-26269f08a98a:', 'unhandled rejection:', p);
});
process.on('uncaughtException', p => {
    bunion_1.default.error('357afd36-5180-49d0-b626-b592273329f2:', 'uncaught exception:', p);
});
