const fs = require('fs');
const path = require('path');

// Función para cargar un archivo JSON con una ruta absoluta
function loadJSON(fileName) {
  const filePath = path.join(__dirname, fileName); // Obtener la ruta absoluta del archivo
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}


// Función para aumentar el precio en el JSON según las condiciones dadas
function updatePrices() {
  try {
    // Cargar el JSON
    const jsonData = loadJSON('../JSONs/toUpdate24Oct.json'); // Reemplaza 'jsonA.json' con la ruta a tu archivo

    // Parsear el JSON

    // Filtrar productos con compare_at_price en variants
    const filteredProducts = jsonData.updated.filter(item => 
        item.product.variants.some(variant => variant.hasOwnProperty('compare_at_price'))
    );

    // Guardar el resultado en un nuevo archivo JSON
    fs.writeFile('filteredData.json', JSON.stringify({ updated: filteredProducts }, null, 2), (err) => {
        if (err) {
            console.error('Error al escribir el archivo:', err);
        } else {
            console.log('Archivo filtrado guardado como filteredData.json');
        }
    });
    console.log('El archivo updated_jsonA.json ha sido generado exitosamente con los precios actualizados.');
  } catch (error) {
    console.error('Error al actualizar los precios:', error);
  }
}

// Ejecutar la actualización de precios
updatePrices();
