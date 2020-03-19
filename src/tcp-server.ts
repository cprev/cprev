'use strict';

import * as net from 'net';
import JSONParser from "@oresoftware/json-stream-parser";
import {ChangePayload, ReadPayload} from "./types";
import {onChange} from "./on-change";
import {onRead} from "./on-read";

export const connections = new Set<net.Socket>();

export interface SocketMessage {
  type: 'read' | 'change',
  val: ReadPayload | ChangePayload
}

const doWrite = (s: net.Socket, v: any) => {
  s.write(JSON.stringify({val: v}) + '\n');
};

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

  });

});
