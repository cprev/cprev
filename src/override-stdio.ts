'use strict';

import {any} from "async";
import {LinkedQueue} from "@oresoftware/linked-queue";
import * as fs from 'fs';

const writeToStout = process.stdout.write.bind(process.stdout);

const q = new LinkedQueue();

const fd = (process.stdout as any).fd;

console.log({fd});

fs.createReadStream(null as any, {fd}).on('data', d => {
  console.log({d});
});


process.stdout.write = (a: any, b?: any, c?: any) => {

  q.push([a,b,c]);


  return writeToStout(a, b, c)
};


console.log(1);
console.log(2);
console.log(3);
