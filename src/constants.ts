import * as path from "path";


export const localAgentSocketFileName = 'agent.sock';
export const localAgentSocketPath = path.resolve(`${process.env.HOME}/.cprev/sockets/${localAgentSocketFileName}`);

export const httpServerHost = '0.0.0.0';
export const tcpServerHost = '0.0.0.0';
export const httpServerPort = 3045;
export const tcpServerPort = 3046;


export const ignoredPaths = [
  '/node_modules/',
  // '/.git/',
  '/.idea/',
  '/.vscode/',
  `${process.env.GOPATH}/pkg`,
];

export const ignorePathsRegex = ignoredPaths.map(v => new RegExp(v, 'i'));

//
//
//
//
//
//
//
