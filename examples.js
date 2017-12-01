var Emitter = require('./');
var obj = {};
Emitter.mixin(obj);
obj.on('status', console.log);
obj.emit('status', 'I emit!');
console.log(obj)
