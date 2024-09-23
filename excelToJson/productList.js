const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path')

const convertProductListToExcel = (productList, outputFilePath) => {
  try {
    const worksheetData = [
      ['ID', 'Title', 'SKU'] 
    ];

    productList.forEach(product => {
      worksheetData.push([product.id, product.title, product.sku]);
    });

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    xlsx.writeFile(workbook, outputFilePath);

    console.log(`Excel generado exitosamente en: ${outputFilePath}`);
  } catch (error) {
    console.error(`Error generando el archivo Excel: ${error.message}`);
  }
};

const productList = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../JSON_examples/productList.json'), 'utf8'));
convertProductListToExcel(productList, './products.xlsx');
