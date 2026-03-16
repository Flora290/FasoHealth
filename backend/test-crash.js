const fs = require('fs');
try {
  require('./server');
} catch (err) {
  fs.writeFileSync('./crash.log', 'CRASH MESSAGE: ' + err.message + '\n\nSTACK: ' + err.stack);
}
