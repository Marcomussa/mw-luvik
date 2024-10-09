const fs = require('fs');
const path = require('path'); // Módulo para trabajar con rutas

// Función para cargar un archivo JSON con una ruta absoluta
function loadJSON(fileName) {
  const filePath = path.join(__dirname, fileName); // Obtener la ruta absoluta del archivo
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Función para aumentar los precios en JSON A según las condiciones
function increasePrices() {
  try {
    // Cargar JSON A
    const jsonA = loadJSON('../jsonToJson/toCreateListaInterior9Oct.json');

    // Aplicar el aumento de precios
    const updatedJsonA = jsonA.created.map(item => {
      const product = item.product;

      // Recorrer las variantes y aplicar la condición del aumento
      product.variants = product.variants.map(variant => {
        // Si existe "compare_at_price", convertirlo a número y aumentarlo en 1.06
        if (variant.compare_at_price) {
          variant.compare_at_price = (parseFloat(variant.compare_at_price) * 1.06).toFixed(2);
        } else {
          // Si no existe "compare_at_price", aumentar "price" en 1.06
          variant.price = (parseFloat(variant.price) * 1.06).toFixed(2);
        }
        return variant;
      });

      return item;
    });

    // Guardar el nuevo JSON en un archivo llamado updated_jsonA_prices.json
    const outputFilePath = path.join(__dirname, 'updated_jsonA_prices.json');
    fs.writeFileSync(outputFilePath, JSON.stringify({ updated: updatedJsonA }, null, 2), 'utf-8');
    console.log('El archivo updated_jsonA_prices.json ha sido generado exitosamente con el aumento de precios.');
  } catch (error) {
    console.error('Error al aumentar los precios en el JSON A:', error);
  }
}

// Ejecutar el aumento de precios
increasePrices();
