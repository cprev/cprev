'use strict';

import * as net from "net";
import log from "bunion";
import JSONParser from "@oresoftware/json-stream-parser";
import {SocketMessage} from "./agent";

const doWrite = (s: net.Socket, v: any) => {

  if (!s.writable) {
    log.warn('3d6e661f-2c6f-4e6e-adeb-0c9729fc2df6: socket is not writable.');
    return;
  }
  log.info("376aa75b-854e-4b67-99d7-55efafe8f7f3 writing payload:", v);
  s.write(JSON.stringify({val: v}) + '\n', 'utf8');
};

export const connections = new Set<net.Socket>();


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
  // s.on('data', (d: SocketMessage) => {

    if (!(d.val && d.val.repo && typeof d.val.repo === 'string')) {
      return doWrite(s, {error: 'missing repo'});
    }

    log.error('8fe8e800-1525-4870-930b-2eeec3c42fbd: no task matched type:', d.type);

    doWrite(s, {
      error: `fc892414-4e91-456c-a6ef-55ef1bfcc92c: no task matched type: '${d.type}'`
    });

  });

});
