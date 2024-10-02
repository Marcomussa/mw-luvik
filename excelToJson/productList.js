const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");

const jsonFilePath = path.join(__dirname, "../JSON_examples/productList.json");
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

function generateExcelFromJSON(jsonData) {
  const excelData = [];

  jsonData.forEach((item) => {
    const collectionsTitles = item.collections
      .map((collection) => collection.title)
      .join(", ");
    const {
      sku,
      price,
      compare_at_price,
      inventory_management,
      inventory_quantity,
    } = item.variants[0];

    const row = {
      ID: item.id,
      Title: item.title,
      Collections: collectionsTitles,
      SKU: sku,
      Price: price,
      CompareAtPrice: compare_at_price,
      InventoryManagement: inventory_management,
      InventoryQuantity: inventory_quantity,
    };

    excelData.push(row);
  });

  const workbook = xlsx.utils.book_new();

  const worksheet = xlsx.utils.json_to_sheet(excelData);

  xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

  const outputFilePath = path.join(__dirname, "products.xlsx");
  xlsx.writeFile(workbook, outputFilePath);

  console.log(`Archivo Excel generado exitosamente en: ${outputFilePath}`);
}

// Llamar a la función para generar el Excel
generateExcelFromJSON(jsonData);
