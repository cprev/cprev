'use strict';

import * as net from 'net';
import JSONParser from "@oresoftware/json-stream-parser";
import {ChangePayload, ReadPayload} from "../types";
import * as path from "path";
import * as fs from 'fs';
import log from 'bunion';
import * as c from '../constants';
import {localAgentSocketPath} from "../constants";


if (require.main === module){
  log.error('8224ed20-4d86-471f-9dae-e51d37b82cc8:', 'cannot run the agent.js file directly - use main.js.');
  process.exit(1);
}

export const connections = new Set<net.Socket>();

export interface SocketMessage {
  type: 'read' | 'change',
  val: ReadPayload | ChangePayload
}

const doWrite = (s: net.Socket, v: any) => {
  s.write(JSON.stringify({val: v}) + '\n');
};

const cache = {
  conn: <unknown>null as net.Socket
};

const makeNewConnection = () => {

  const conn = cache.conn = net.createConnection({
    port: c.httpServerPort,
    host: c.httpServerHost
  });

  conn.once('connect', () => {
    log.info('agent connected to server via tcp:', c.httpServerHost, c.httpServerPort);
  });

  conn.once('error', e => {
    log.error('0996b105-0a2d-4fa6-a67d-ff7853ff0133:', 'socket conn error: ', e);
    conn.removeAllListeners();
    setTimeout(() => {
      makeNewConnection();
    }, 2000);
  });

  conn.once('disconnect', () => {
    conn.removeAllListeners();
    log.info('996d5da1-1a73-40d7-a38d-043f13c8a5f1:', 'connection disconnected.');
    setTimeout(() => {
      makeNewConnection();
    }, 10);
  });

  conn.once('end', () => {
    conn.removeAllListeners();
    log.info('d63a8250-a062-4117-bc2e-1f2d39295328:', 'connection ended.');
    setTimeout(() => {
      makeNewConnection();
    }, 10);
  });

  return conn;
};

cache.conn = makeNewConnection();

export const agentTcpServer = net.createServer(s => {

  connections.add(s);

  s.once('error', e => {
    log.error('08e3add4-b9ec-418e-b255-d0afd0a2ec50:', 'socket conn error: ', e);
    s.removeAllListeners();
    connections.delete(s);
  });

  s.once('disconnect', () => {
    log.info('19588471-b830-4f99-bfa0-0048cd3a905d:', 'connection disconnected.');
    connections.delete(s);
  });

  s.once('end', () => {
    log.info('cc06fa58-519f-4743-b211-c826bd085b58:', 'connection ended.');
    connections.delete(s);
  });

  s.pipe(new JSONParser()).on('data', (d: SocketMessage) => {

    if (!(d.val && d.val.repo && typeof d.val.repo === 'string')) {
      return doWrite(s, {error: 'missing repo'});
    }

    doWrite(s, {
      error: `no task matched type: '${d.type}'`
    });

  });

});



