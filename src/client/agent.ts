'use strict';

import * as net from 'net';
import JSONParser from "@oresoftware/json-stream-parser";
import {ChangePayload, ReadPayload} from "../types";
import * as path from "path";
import * as fs from 'fs';
import log from 'bunion';
import {localAgentSocketPath} from "../constants";

export const connections = new Set<net.Socket>();

export interface SocketMessage {
  type: 'read' | 'change',
  val: ReadPayload | ChangePayload
}

const doWrite = (s: net.Socket, v: any) => {
  s.write(JSON.stringify({val: v}) + '\n');
};

const cache = {
  conn: <unknown> null as net.Socket
};

const makeNewConnection = () => {

  const conn = cache.conn =  net.createConnection({
    port: 3118,
    host: 'localhost'
  });

  conn.once('error', e => {
    console.error('socket conn error: ', e);
    s.removeAllListeners();
    makeNewConnection();
  });

  conn.once('disconnect', () => {
    s.removeAllListeners();
    console.log('connection disconnected.');
    makeNewConnection();
  });

  conn.once('end', () => {
    s.removeAllListeners();
    console.log('connection ended.');
    makeNewConnection();
  });

  return conn;
};

cache.conn = makeNewConnection();

const s = net.createServer(s => {

  connections.add(s);

  s.once('error', e => {
    console.error('socket conn error: ', e);
    s.removeAllListeners();
    connections.delete(s);
  });

  s.once('disconnect', () => {
    console.log('connection disconnected.');
    connections.delete(s);
  });

  s.once('end', () => {
    console.log('connection ended.');
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



try{
  fs.unlinkSync(localAgentSocketPath)
}
catch(err){
  log.warn('Could not unlink file:', localAgentSocketPath);
}

try{
  fs.mkdirSync(path.dirname(localAgentSocketPath), {recursive: true});
}
catch(err){
  log.error('Could not create dir:', path.dirname(localAgentSocketPath));
  process.exit(1);
}

s.listen(localAgentSocketPath, () => {
  log.info('agent socket server listening on path:', localAgentSocketPath);
});
