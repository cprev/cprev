
const http = require('http');

const s = http.createServer((req,res) => {
  res.end('foo');
});

s.listen(5005, '127.0.6.8', () => {
  console.log('listening on special loopback addr');
});

