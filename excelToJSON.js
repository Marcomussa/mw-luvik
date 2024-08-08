const xlsx = require('xlsx');
const fs = require('fs');
const path = require("path")

const workbook = xlsx.readFile(path.join(__dirname, "./files/excel.xlsx"));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet);

const parseCollection = (collectionStr) => {
  const cleanedStr = collectionStr.replace(/^"|"$/g, '');
  return cleanedStr.split(',').map(id => parseInt(id.trim(), 10));
};

const buildShopifyProduct = (row) => {
  let product = {};

  if (row.title) product.title = row.title;
  if (row.lumps) product.lumps = row.lumps;
  if (row.tags) product.tags = row.tags;
  if (row.collection) product.collection = parseCollection(row.collection),

  product.variants = [{
    inventory_management: "shopify",
    inventory_quantity: row.stock ? row.stock : "",
    price: row.price ? row.price : "",
    compare_at_price: row.compare_at_price ? row.compare_at_price : "",
    sku: row.sku,
  }];

  return {
    product
  };
};

// Crear un array de productos
const products = data.map(row => buildShopifyProduct(row));

const finalOutput = {
  created: products
};

fs.writeFileSync('productos.json', JSON.stringify(finalOutput, null, 2));

console.log('Archivo JSON generado correctamente');