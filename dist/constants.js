"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ignorePathsRegex = exports.ignoredPaths = exports.tcpServerPort = exports.httpServerPort = exports.tcpServerHost = exports.httpServerHost = exports.localAgentSocketPath = exports.localAgentSocketFileName = void 0;
const path = require("path");
exports.localAgentSocketFileName = 'agent.sock';
exports.localAgentSocketPath = path.resolve(`${process.env.HOME}/.cprev/sockets/${exports.localAgentSocketFileName}`);
exports.httpServerHost = process.env.cprev_host || '0.0.0.0';
exports.tcpServerHost = process.env.cprev_host || '0.0.0.0';
exports.httpServerPort = 3045;
exports.tcpServerPort = 3046;
exports.ignoredPaths = [
    '/node_modules/',
    '/.git/',
    '/.idea/',
    '/.cprev/lib/',
    '/.vscode/',
    `${process.env.GOPATH}/pkg/`,
];
exports.ignorePathsRegex = exports.ignoredPaths.map(v => new RegExp(v, 'i'));
