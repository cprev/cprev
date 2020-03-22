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


export const cache = {
  conn: <unknown>null as net.Socket,
  resolutions: new Map<string, (d : any) => void>()
};







