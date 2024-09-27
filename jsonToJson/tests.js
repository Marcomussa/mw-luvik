const fs = require('fs');
const path = require('path');

const originalJsonFilePath = path.join(__dirname, '../JSON_examples/toCreate27Sept.json');
const originalJsonData = JSON.parse(fs.readFileSync(originalJsonFilePath, 'utf-8'));

function test() {
    console.log(originalJsonData.created.length)
    return true
}

// Ejecutar la función
test();
