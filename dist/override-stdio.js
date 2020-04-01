'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const linked_queue_1 = require("@oresoftware/linked-queue");
const fs = require("fs");
const writeToStout = process.stdout.write.bind(process.stdout);
const q = new linked_queue_1.LinkedQueue();
const fd = process.stdout.fd;
console.log({ fd });
fs.createReadStream(null, { fd }).on('data', d => {
    console.log({ d });
});
process.stdout.write = (a, b, c) => {
    q.push([a, b, c]);
    return writeToStout(a, b, c);
};
console.log(1);
console.log(2);
console.log(3);
