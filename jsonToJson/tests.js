const fs = require('fs');
const path = require("path")

// Cargar archivos JSON
const filePath = path.join(__dirname, "../JSON_examples/productList.json");  // Ruta del archivo JSON

// Leer y parsear el archivo JSON
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Recorrer los productos y eliminar la propiedad "compare_at_price" si es null
jsonData.forEach(product => {
    if(product.variants.sku == ""){
        console.log(product)
    }
});

// Sobrescribir el archivo JSON con los cambios
fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

console.log('Ok');
