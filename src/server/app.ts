'use strict';

import * as express from 'express';
import * as bodyParser from "body-parser";
import {ChangePayload, ReadPayload, Repos} from "../types";
import {onChange} from './on-change';
import {onRead} from "./on-read";
import log from "bunion";

if (require.main === module){
  log.error('18baedca-f9bc-44fb-abf3-849bc7ace2ae:', 'cannot run the file directly - use main.js.');
  process.exit(1);
}

//TODO: the IDE should show when/who the opened file was last modified by someone else on the team

const app = express();

app.use(bodyParser.json());


app.post('/read', (req,res) => {

  const b = req.body as ReadPayload;

  if(!(b.repo && typeof b.repo === 'string')){
    return res.status(422).json({error:'The "repo" field must be a string.'});
  }

  onRead(b, v => {
    res.json(v);
  });

});

app.post('/change', (req,res) => {

  const b = req.body as ChangePayload;

  if(!(b.repo && typeof b.repo === 'string')){
    return res.status(422).json({error:'The "repo" field must be a string.'});
  }

  onChange(b, v => {
    res.json(v);
  });

});


export {app};
