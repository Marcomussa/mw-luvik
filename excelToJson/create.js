const xlsx = require('xlsx');
const fs = require('fs');
const path = require("path")

const workbook = xlsx.readFile(path.join(__dirname, "../files/created.xlsx"));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet);

const parseCollection = (collectionStr) => {
  const cleanedStr = collectionStr.replace(/^"|"$/g, '');
  return cleanedStr.split(';').map(id => parseInt(id.trim(), 10));
};

const removeEmptyValues = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === "") {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      removeEmptyValues(obj[key]); 
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map(item => {
        if (typeof item === 'object') {
          return removeEmptyValues(item);
        }
        return item;
      }).filter(item => item !== undefined && item !== "");
    }
  });
  return obj;
};

const buildShopifyProduct = (row) => {
  let product = {};

  product.id = row.id != undefined ? row.id : "" 
  product.title = row.title != undefined ? row.title : "" 
  product.vendor = row.vendor != undefined ? row.vendor : "" 
  product.tags = row.tags != undefined ? row.tags : "" 
  product.collection = row.collection != undefined ? parseCollection(row.collection) : "" 

  product.variants = [{
    inventory_management: "shopify",
    inventory_quantity: row.stock !== undefined ? row.stock : "",
    price: row.price !== undefined ? row.price : "",  
    compare_at_price: row.compare_at_price !== undefined ? row.compare_at_price : "", 
    sku: row.sku !== undefined ? row.sku : "" 
  }];

  return removeEmptyValues({ product });
};

const products = data.map(row => buildShopifyProduct(row));

const finalOutput = {
  created: products
};

fs.writeFileSync('productos.json', JSON.stringify(finalOutput, null, 2));

console.log('Archivo JSON generado correctamente');