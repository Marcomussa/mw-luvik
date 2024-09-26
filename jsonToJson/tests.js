const fs = require('fs');
const path = require("path")

// Cargar archivos JSON
const filePath = path.join(__dirname, "../JSON_examples/productsWithMissingSKU.json");  // Ruta del archivo JSON

// Leer y parsear el archivo JSON
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Recorrer los productos y eliminar la propiedad "compare_at_price" si es null
jsonData.updated.forEach(productEntry => {
    delete productEntry.product.lumps
});

// Sobrescribir el archivo JSON con los cambios
fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

console.log('Archivo actualizado');
