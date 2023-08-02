const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`server listening on port ${port}`);
});

server.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
