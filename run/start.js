const connect = require('connect');
const open = require('open');
const serveStatic = require('serve-static');

connect().use(serveStatic('./webapp')).listen(3000, function(){
    console.log('Server running on 3000...');
    open('http://localhost:3000');
});