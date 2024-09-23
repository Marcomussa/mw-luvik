const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'app.log');

// flujo de escritura al archivo de logs
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' }); // Flag 'a' para agregar contenido sin sobrescribir

// referencias originales de console.log y console.error
const originalLog = console.log;
const originalError = console.error;

// registrar los mensajes en el archivo de log
function writeLog(type, args) {
  const timestamp = new Date().toISOString();
  const message = `${type} [${timestamp}]: ${args.join(' ')}\n`;

  logStream.write(message);
}

console.log = function (...args) {
  writeLog('LOG', args); // Registrar en el archivo
  originalLog.apply(console, args); // Mantener el comportamiento original
};

console.error = function (...args) {
  writeLog('ERROR', args); // Registrar en el archivo
  originalError.apply(console, args); // Mantener el comportamiento original
};

module.exports = {
  logFilePath,
};
