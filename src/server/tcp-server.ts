'use strict';

import * as net from 'net';
import JSONParser from "@oresoftware/json-stream-parser";
import {ChangePayload, GitPayload, ReadPayload, SocketMessage} from "../types";
import {onChange} from "./on-change";
import {onRead} from "./on-read";
import log from 'bunion';
import * as uuid from 'uuid';
import {onGitChange} from "./on-git-change";

if (require.main === module) {
  log.error('757b18f0-9a5e-481b-91a8-9dee60df4ac0:', 'cannot run the file directly - use main.js.');
  process.exit(1);
}

export const connections = new Set<net.Socket>();

const doWrite = (s: net.Socket, originalReqId: string | null, userUuid: string, v: { reqUuid: string, [key: string]: any }) => {
  if (!s.writable) {
    log.warn('bae5c25d-60c6-4dd5-91af-d993142199ae: socket is not writable.');
    return;
  }
  if(!(v && typeof v === 'object')){
    log.warn('payload is not an object:', v);
    return;
  }
  if(v.resUuid){
    log.warn('refusing to write to socket since payload has resUuid property:', v);
    return;
  }
  log.info(`5897e002-6690-42b3-8fa3-fa5ec7929541 writing payload to client ('${userUuid}'):`, v);
  v.resUuid = originalReqId || null;
  s.write(JSON.stringify(v) + '\n', 'utf8');

};

export const tcpServer = net.createServer(s => {

  connections.add(s);

  log.info('db8e1576-91d2-43f6-9285-6ff35d0f864a: new connection.');

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


  ////
  s.pipe(new JSONParser()).on('data', (d: SocketMessage) => {
    // s.on('data', (d: SocketMessage) => {

    const reqId = d.reqUuid || null;

    const userUuid = d.userUuid;

    if(!userUuid){
      return doWrite(s, reqId, null as any, {
        result: 'error',
        error: 'missing userUuid in request',
        reqUuid: uuid.v4()
      });
    }

    if(d.type === 'git'){
      return onGitChange(d.val as GitPayload, userUuid, v => {
        doWrite(s, reqId, userUuid, v);
      });
    }

    // if (!(d.val && d.val.repo_path && typeof d.val.repo_path === 'string')) {
    //   return doWrite(s, reqId, {
    //     error: 'missing repo',
    //     reqUuid: uuid.v4()
    //   });
    // }

    if (d.type === 'change') {
      return onChange(d.val as ChangePayload, userUuid, v => {
        doWrite(s, reqId, userUuid, v);
      });
    }

    if (d.type === 'read') {
      return onRead(d.val as ReadPayload, userUuid, v => {
        doWrite(s, reqId, userUuid, v);
      });
    }

    log.error('e0a00403-74b0-4fc9-bf94-a305bef71c68: no task matched type:', d.type);

    doWrite(s, reqId, userUuid, {
      errId: 'd2fd1c06-66c4-4b74-b56a-e11eac1a85ce',
      reqUuid: uuid.v4(),
      error: `no task matched type: '${d.type}'`
    });

  });

});

