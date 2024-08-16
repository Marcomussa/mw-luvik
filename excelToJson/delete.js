const xlsx = require('xlsx');
const fs = require('fs');
const path = require("path")

const workbook = xlsx.readFile(path.join(__dirname, "../files/delete.xlsx"));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet);

const deletedProductIds = data.map(row => row.id.toString());

const finalOutput = {
  deleted: deletedProductIds
};

fs.writeFileSync('productos.json', JSON.stringify(finalOutput, null, 2));

console.log('Archivo JSON generado correctamente');