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
    const jsonData = loadJSON('../jsonToJson/toCreateListaInterior10Oct.json'); // Reemplaza 'jsonA.json' con la ruta a tu archivo

    // Recorrer los productos y actualizar el "price" de cada variante
    const updatedData = jsonData.created.map(item => {
      const product = item.product;

      // Recorrer las variantes y aumentar "price" en un 6%
      product.variants = product.variants.map(variant => {
        if (variant.price) {
          // Convertir price a número antes de realizar el cálculo
          let price = parseFloat(variant.price);
          let compare_at_price = parseFloat(variant.compare_at_price)

          if (variant.compare_at_price) {
            // Si existe compare_at_price, aumentar el precio en un 6%
            variant.compare_at_price = (compare_at_price * 1.06).toFixed(2);
          } else {
            // Si no existe compare_at_price, también aumentar el precio en un 6%
            variant.price = (price * 1.06).toFixed(2);
          }
        }
        return variant;
      });

      return item;
    });

    // Guardar el nuevo JSON en el archivo original
    const outputFilePath = path.join(__dirname, 'updated_jsonA.json');
    fs.writeFileSync(outputFilePath, JSON.stringify({ created: updatedData }, null, 2), 'utf-8');
    console.log('El archivo updated_jsonA.json ha sido generado exitosamente con los precios actualizados.');
  } catch (error) {
    console.error('Error al actualizar los precios:', error);
  }
}

// Ejecutar la actualización de precios
updatePrices();
