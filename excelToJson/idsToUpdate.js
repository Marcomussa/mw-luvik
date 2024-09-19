const fs = require('fs');
const xlsx = require('xlsx');

const jsonData = JSON.parse(fs.readFileSync('productsToUpdateStock.json', 'utf8'));

const createExcel = (data) => {
    const workbook = xlsx.utils.book_new();

    const worksheet = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Productos');

    xlsx.writeFile(workbook, 'productos.xlsx');
};

if (jsonData.success) {
    createExcel(jsonData.data);
} else {
    console.error('No se pudo procesar los datos.');
}
