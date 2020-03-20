'use strict';

import * as net from "net";
import log from "bunion";
import JSONParser from "@oresoftware/json-stream-parser";
import {SocketMessage} from "./agent";

const doWrite = (s: net.Socket, v: any) => {
  s.write(JSON.stringify({val: v}) + '\n');
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

    if (!(d.val && d.val.repo && typeof d.val.repo === 'string')) {
      return doWrite(s, {error: 'missing repo'});
    }

    doWrite(s, {
      error: `no task matched type: '${d.type}'`
    });

  });

});
