"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.localAgentSocketFileName = 'agent.sock';
exports.localAgentSocketPath = path.resolve(`${process.env.HOME}/.cprev/sockets/${exports.localAgentSocketFileName}`);
exports.httpServerHost = '0.0.0.0';
exports.tcpServerHost = '0.0.0.0';
exports.httpServerPort = 3045;
exports.tcpServerPort = 3046;
exports.ignoredPaths = [
    '/node_modules/',
    '/.git/',
    '/.idea/',
    '/.vscode/',
    `${process.env.GOPATH}/pkg`,
];
exports.ignorePathsRegex = exports.ignoredPaths.map(v => new RegExp(v, 'i'));
