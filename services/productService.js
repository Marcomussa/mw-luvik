const shopifyClient = require('../clients/shopifyClient');
const productController = require("../controllers/productController")

exports.handleBatch = async (created, updated, deleted) => {
  // Procesar productos creados
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const createdProductIds = [];

  if (created || updated ) {
    await productController.postCollectionsToDB()
  }

  // Procesar productos creados
  if (created && created.length > 0) {
    for (const product of created) {
      try {
        const response = await shopifyClient.createProduct(product);

        if (response && response.product && response.product.id) {
          createdProductIds.push(response.product.id);
          await productController.postProductToDB(response, product.product.collection);
        }

        console.log(`Producto creado: ${product.product.title}`);
      } catch (error) {
        console.log(`Error al crear producto ${product.product.title}: ${error.message}`);
      }
      await delay(300);
    }

    return createdProductIds;
  }

  // Procesar productos actualizados
  if (updated && updated.length > 0) {
    for (const product of updated) {
      try {
        const response = await shopifyClient.updateProduct(product.product.id, product);

        if(response){
          await productController.updateProductToDB(product);
        }

        console.log(`Producto ${product.product.id} Actualizado Correctamente`)
      } catch (error) {
        console.log(`Error al actualizar producto ${product.product.title}: ${error.message}`);
      }
      await delay(300);
    }
  }

  // Procesar productos eliminados
  if (deleted && deleted.length > 0) {
    for (const productId of deleted){
      try {
        await shopifyClient.deleteProduct(productId)
        console.log(`Producto ${productId} Eliminado Correctamente`)
      } catch (error) {
        console.log(`Error eliminando producto ${error}`)
        throw error
      }
    }
    await delay(500)
  }
};

