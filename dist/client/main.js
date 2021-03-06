#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const bunion_1 = require("bunion");
const fs = require("fs");
const constants_1 = require("../constants");
const path = require("path");
const agent_tcp_server_1 = require("./agent-tcp-server");
const get_watchable_dirs_1 = require("./get-watchable-dirs");
const _cprev_conf_js_1 = require("../.cprev.conf.js");
const watch_dirs_1 = require("./watch-dirs");
const utils_1 = require("../utils");
const rootDirs = _cprev_conf_js_1.default.codeRoots;
get_watchable_dirs_1.getWatchableDirs(rootDirs, constants_1.ignorePathsRegex, (err, dirs) => {
    if (err) {
        bunion_1.default.error('4585a17b-a478-4ba0-beca-c0702d0983ea:', err);
        process.exit(1);
    }
    if (!(dirs && dirs.length > 0)) {
        bunion_1.default.error('cfe59e4a-8b5c-4cfd-ab7d-6fdec27e39a6:', `No folders to watch - add a ".cprev.js" file to folders within your "codeRoots" property in ".cprev.conf.js"`);
        process.exit(1);
    }
    watch_dirs_1.watchDirs(dirs);
});
const mydirs = [
    path.resolve(process.env.HOME + '/.cprev'),
    path.resolve(process.env.HOME + '/.cprev/conf')
];
for (const d of mydirs) {
    utils_1.mkdirSafe(d);
}
get_watchable_dirs_1.getWatchableDirs(mydirs, [new RegExp('/.cprev/lib/')], (err, dirs) => {
    if (err) {
        bunion_1.default.error(err);
        bunion_1.default.fatal('Could not watch the following dirs:', dirs);
    }
    let to = null;
    for (const i of dirs) {
        fs.watch(i.dirpath, (event, filename) => {
            clearTimeout(to);
            to = setTimeout(() => {
                bunion_1.default.info('Config file changed, restarting.');
                process.exit(0);
            }, 800);
        });
    }
});
try {
    fs.unlinkSync(constants_1.localAgentSocketPath);
}
catch (err) {
    bunion_1.default.warn('Could not unlink file:', constants_1.localAgentSocketPath);
}
try {
    fs.mkdirSync(path.dirname(constants_1.localAgentSocketPath), { recursive: true });
}
catch (err) {
    bunion_1.default.warn('Could not create dir:', path.dirname(constants_1.localAgentSocketPath));
}
agent_tcp_server_1.agentTcpServer.listen(constants_1.localAgentSocketPath, () => {
    bunion_1.default.info('agent socket server listening on path:', constants_1.localAgentSocketPath);
});
process.once('SIGTERM', () => {
    setTimeout(() => {
        bunion_1.default.warn('server close timed out.');
        process.exit(1);
    }, 2000);
    agent_tcp_server_1.agentTcpServer.close(() => {
        process.exit(1);
    });
});
process.once('SIGINT', () => {
    setTimeout(() => {
        bunion_1.default.warn('server close timed out.');
        process.exit(1);
    }, 2000);
    agent_tcp_server_1.agentTcpServer.close(() => {
        process.exit(1);
    });
});
