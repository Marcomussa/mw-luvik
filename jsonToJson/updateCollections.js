const fs = require('fs');
const path = require('path')

//! Recibe un CSV tipo y devuelve un listado de productos JSON donde cada coleccion estara dentro de newCollection
//! Para asignar el ID se debe usar syncProductsToUpdateCollections.js

const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data); 
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

const transformObject = (obj) => {
  const newObject = {
    sku: obj["0"],
    titulo: obj["Codigo de Barras"],
    newCollection: []
  };

  // Iterar sobre las claves para agregar las que empiezan con "" o "__"
  for (const key in obj) {
    if (key === "" || key.startsWith("__")) {
      if (obj[key]) { // Solo incluir valores que no están vacíos
        newObject.newCollection.push(obj[key]);
      }
    }
  }
  return newObject;
};

// Ruta del archivo que se desea modificar
const filePath = path.join(__dirname, '../JSON_examples/toUpdateCollections.json') // Cambia esto por la ruta correcta

// Leer el archivo JSON
const originalArray = readJSONFile(filePath);

if (originalArray) {
  const transformedArray = originalArray.map(transformObject);
  writeJSONFile(filePath, transformedArray);
}
