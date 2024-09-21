const fs = require('fs');
const path = require('path');

//! Este script asigna 'product: {}' a cada item del arreglo una vez pase por ambos parseos

const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data); // Convertir el JSON en objetos
  } catch (err) {
    console.error(`Error leyendo el archivo: ${err}`);
    return null;
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('El archivo ha sido modificado exitosamente.');
  } catch (err) {
    console.error(`Error escribiendo el archivo: ${err}`);
  }
};

// Función para transformar los datos al nuevo formato
const transformData = (originalData) => {
  return originalData.map((item) => ({
    product: {
      newCollection: item.newCollection,
      id: item.id
    }
  }));
};

const filePath = path.join(__dirname, '../JSON_examples/toUpdateCollections.json'); // Archivo original con los productos
const originalData = readJSONFile(filePath);

if (originalData) {
  const transformedData = transformData(originalData);
  writeJSONFile(filePath, transformedData);
} else {
  console.error('Error: No se pudo leer el archivo.');
}
