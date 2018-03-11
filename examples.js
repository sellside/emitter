const emitter = require('./');
const obj = {};
let n = 0;
const log = msg => console.log(msg, ++n);

emitter(obj);
obj.on('status', log);
obj.on('status', log);
obj.on('status', log);
obj.emit('status', 'I emit!');

console.log(obj);
