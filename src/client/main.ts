'use strict';

import log from "bunion";
import * as fs from "fs";
import {localAgentSocketPath} from "../constants";
import * as path from "path";
import {agentTcpServer} from './agent'

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

agentTcpServer.listen(localAgentSocketPath, () => {
  log.info('agent socket server listening on path:', localAgentSocketPath);
});


process.once('SIGTERM', () => {

  setTimeout(() => {
    log.warn('server close timed out.');
    process.exit(1);
  }, 2000);

  agentTcpServer.close(() => {
    process.exit(1)
  });
});

process.once('SIGINT', () => {

  setTimeout(() => {
    log.warn('server close timed out.');
    process.exit(1);
  }, 2000);

  agentTcpServer.close(() => {
    process.exit(1)
  });

});
