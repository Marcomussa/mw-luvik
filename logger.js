const fs = require('fs');
const path = require('path');

// Ruta para almacenar los logs en un archivo
const logFilePath = path.join(__dirname, 'app.log');

// Crear un flujo de escritura al archivo de logs
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' }); // Flag 'a' para agregar contenido sin sobrescribir

// Guardar las referencias originales de console.log y console.error
const originalLog = console.log;
const originalError = console.error;

// Función para registrar los mensajes en el archivo de log
function writeLog(type, args) {
  const timestamp = new Date().toISOString();
  const message = `${type} [${timestamp}]: ${args.join(' ')}\n`;

  // Escribir en el archivo de log
  logStream.write(message);
}

// Sobrescribir console.log
console.log = function (...args) {
  writeLog('LOG', args); // Registrar en el archivo
  originalLog.apply(console, args); // Mantener el comportamiento original
};

// Sobrescribir console.error
console.error = function (...args) {
  writeLog('ERROR', args); // Registrar en el archivo
  originalError.apply(console, args); // Mantener el comportamiento original
};

// Exportar si necesitas agregar más funcionalidades al logger
module.exports = {
  logFilePath,
};
