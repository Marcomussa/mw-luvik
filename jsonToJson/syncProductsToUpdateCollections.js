const fs = require("fs");
const path = require("path");

//! Sincroniza un JSON el cual tiene las colecciones y el sku con su ID asociado. Utiliza el SKU para sincronizarlos.

const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data); // Convertir el JSON en objetos
  } catch (err) {
    console.error(`Error leyendo el archivo: ${err}`);
    return null;
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log("El archivo ha sido modificado exitosamente.");
  } catch (err) {
    console.error(`Error escribiendo el archivo: ${err}`);
  }
};

const syncIDs = (originalData, idData) => {
  // Filtrar los productos que tienen un ID correspondiente
  return originalData
    .map((product) => {
      const matchingId = idData.find((item) => item.sku == product.sku);

      if (matchingId) {
        product.id = matchingId.id;
        delete product.titulo;
        delete product.sku;

        return product; 
      }

      return null;
    })
    .filter((product) => product !== null);
};

const originalFilePath = path.join(
  __dirname,
  "../JSON_examples/toUpdateCollections.json"
); 
const idFilePath = path.join(
  __dirname,
  "../JSON_examples/productsToUpdateCollections.json"
); 

const originalData = readJSONFile(originalFilePath);
const idArray = readJSONFile(idFilePath)?.data || []; 

if (originalData && idArray.length) {
  const updatedData = syncIDs(originalData, idArray);
  writeJSONFile(originalFilePath, updatedData);
} else {
  console.error(
    "Error: No se pudo leer el archivo original o el archivo de IDs."
  );
}
