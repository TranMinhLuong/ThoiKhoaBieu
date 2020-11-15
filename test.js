const http = require('http');

http.createServer(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<H1>Hello World!</H1>');
}).listen(3000);

console.log('App is running…');