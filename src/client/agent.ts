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


const cache = {
  conn: <unknown>null as net.Socket
};

export const getConnection = () : Promise<net.Socket> => {
  return new Promise((resolve => {

    if(cache.conn && cache.conn.writable){
      return resolve(cache.conn);
    }

    makeNewConnection().once('connect', () => {
       resolve(cache.conn);
    })
  }));
};

const makeNewConnection = () => {

  if(cache.conn){
    cache.conn.removeAllListeners();
    cache.conn.destroy();
  }

  const conn = cache.conn = net.createConnection({
    port: c.tcpServerPort,
    host: c.tcpServerHost
  });

  conn.once('connect', () => {
    log.info('agent connected to server via tcp:', c.httpServerHost, c.httpServerPort);
  });

  conn.once('error', e => {
    log.error('0996b105-0a2d-4fa6-a67d-ff7853ff0133:', 'socket conn error: ', e);
    conn.removeAllListeners();
    setTimeout(() => {
      makeNewConnection();
    }, 9000);
  });

  conn.once('disconnect', () => {
    conn.removeAllListeners();
    log.info('996d5da1-1a73-40d7-a38d-043f13c8a5f1:', 'connection disconnected.');
    setTimeout(() => {
      makeNewConnection();
    }, 300);
  });

  conn.once('end', () => {
    conn.removeAllListeners();
    log.info('d63a8250-a062-4117-bc2e-1f2d39295328:', 'connection ended.');
    setTimeout(() => {
      makeNewConnection();
    }, 300);
  });

  return conn;
};

cache.conn = makeNewConnection();





