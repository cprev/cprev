import * as path from "path";

export const localAgentSocketPath = path.resolve(process.env.HOME + '/.cprev/sockets/agent.sock');
export const localAgentSocketName = 'agent.sock';

export const httpServerPort = 3045;
export const tcpServerPort = 3046;
