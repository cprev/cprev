'use strict';

import * as net from 'net';
import JSONParser from "@oresoftware/json-stream-parser";
import {ChangePayload, ReadPayload} from "../types";
import {onChange} from "./on-change";
import {onRead} from "./on-read";
import log from 'bunion';

if (require.main === module) {
  log.error('757b18f0-9a5e-481b-91a8-9dee60df4ac0:', 'cannot run the file directly - use main.js.');
  process.exit(1);
}

export const connections = new Set<net.Socket>();

export interface SocketMessage {
  type: 'read' | 'change',
  val: ReadPayload | ChangePayload
}

const doWrite = (s: net.Socket, v: any) => {
  if (!s.writable) {
    log.warn('bae5c25d-60c6-4dd5-91af-d993142199ae: socket is not writable.');
    return;
  }
  log.info("5897e002-6690-42b3-8fa3-fa5ec7929541 writing payload:", v);
  s.write(JSON.stringify({val: v}) + '\n', 'utf8');
};

export const tcpServer = net.createServer(s => {

  connections.add(s);

  s.once('error', e => {
    log.error('6f955362-4aec-4841-ba57-c98cd30cd2b5:', 'socket conn error: ', e);
    // s.removeAllListeners();
    connections.delete(s);
  });


  s.once('disconnect', () => {
    log.info('6f955362-4aec-4841-ba57-c98cd30cd2b5:', 'connection disconnected.');
    connections.delete(s);
  });

  s.once('end', () => {
    log.info('c25f6ed5-a3c6-494e-9493-c2a945bac335:', 'connection ended.');
    connections.delete(s);
  });

  s.pipe(new JSONParser()).on('data', (d: SocketMessage) => {
  // s.on('data', (d: SocketMessage) => {

    if (!(d.val && d.val.repo && typeof d.val.repo === 'string')) {
      return doWrite(s, {error: 'missing repo'});
    }

    if (d.type === 'change') {
      return onChange(d.val as ChangePayload, v => {
        doWrite(s, v);
      });
    }

    if (d.type === 'read') {
      return onRead(d.val as ReadPayload, v => {
        doWrite(s, v);
      });
    }

    doWrite(s, {
      errId: 'd2fd1c06-66c4-4b74-b56a-e11eac1a85ce',
      error: `no task matched type: '${d.type}'`
    });

  });

});

