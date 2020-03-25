'use strict';

const fs = require('fs');
const path = require('path');

// const w = fs.watch(path.resolve(__dirname + '/.git'), (a,b,c) => {
//     console.log('main:', {a,b,c});
// });

const w = fs.watch(path.resolve(__dirname + '/test'), (a,b,c) => {
  console.log('main:', {a,b,c});
});

w.on('change', (a,b,c) => {
  console.log('change',{a,b,c});
});

w.on('read', (a,b,c) => {
  console.log('read:',{a,b,c});
});


console.log(Array.from(undefined));
