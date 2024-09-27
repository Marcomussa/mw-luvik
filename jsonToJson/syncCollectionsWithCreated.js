const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const csvFilePath = path.join(
  __dirname,
  "../JSON_examples/ArticuloColecciones.csv"
);
const jsonFilePath = path.join(
  __dirname,
  "../JSON_examples/toCreate27Sept.json"
);

const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

function updateJSONWithCollections() {
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    const rows = csvData.split('\n');
  
    rows.forEach((row) => {
      const columns = row.split(';');
  
      if (columns.length > 5) {  
        const sku = columns[0];
        const collections = [];
  
        for (let i = 5; i < columns.length; i++) {
          const collectionId = columns[i].trim();  
  
          if (collectionId && !isNaN(collectionId) && Number(collectionId) > 0) {
            collections.push(Number(collectionId)); 
          }
        }
  
        console.log(`SKU: ${sku} -> Colecciones: ${collections}`);
  
        const product = jsonData.created.find((item) =>
          item.product.variants.some(variant => variant.sku === sku)
        );
  
        if (product) {
          const existingCollections = product.product.collection || [];
          const uniqueCollections = [...new Set([...existingCollections, ...collections])];  // Evitar duplicados
          product.product.collection = uniqueCollections;

          console.log(`Producto con SKU ${sku} actualizado con colecciones: ${product.product.collection}`);
        } else {
          console.log(`Producto no encontrado para SKU: ${sku}`);
        }
      }
    });
  
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log('JSON actualizado correctamente.');
  }

updateJSONWithCollections();
