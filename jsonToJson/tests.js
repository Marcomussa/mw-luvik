const fs = require('fs');
const path = require("path")
// Función para filtrar y sobrescribir JSON B usando los títulos de JSON A
const removeCollectionFromJsonA = (jsonAPath) => {
  try {
    // Leer el archivo JSON A
    const jsonA = JSON.parse(fs.readFileSync(jsonAPath, 'utf8'));

    // Recorrer el JSON A y eliminar la propiedad 'collection'
    const updatedJsonA = {
      created: jsonA.created.map(item => {
        // Eliminar la propiedad 'collection' del producto
        delete item.product.collection;
        return item; // Retornar el producto actualizado
      })
    };

    // Sobrescribir el archivo JSON A con los datos actualizados
    fs.writeFileSync(jsonAPath, JSON.stringify(updatedJsonA, null, 2), 'utf8');

    console.log(`La propiedad 'collection' ha sido eliminada del archivo ${jsonAPath}.`);
  } catch (error) {
    console.error(`Error al actualizar el archivo JSON: ${error.message}`);
  }
}

// Ejemplo de uso: pasa las rutas de los archivos JSON A y B
const jsonBPath = path.resolve(__dirname, '../JSON_examples/productList.json')
const jsonAPath = path.resolve(__dirname, '../JSON_examples/ArticulosParaSubir[1].json')

removeCollectionFromJsonA(jsonAPath);
