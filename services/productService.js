const shopifyClient = require('../clients/shopifyClient');

exports.handleBatch = async (created, updated, deleted) => {
  // Procesar productos creados
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const createdProductIds = [];

  // Procesar productos creados
  if (created && created.length > 0) {
    for (const product of created) {
      try {
        const response = await shopifyClient.createProduct(product);

        if (response && response.product && response.product.id) {
          createdProductIds.push(response.product.id);
        }

        console.log(`Producto creado: ${product.product.title}`);
      } catch (error) {
        console.log(`Error al crear producto ${product.product.title}: ${error.message}`);
      }
      await delay(500);
    }

    return createdProductIds;
  }

  // Procesar productos actualizados
  if (updated && updated.length > 0) {
    await Promise.all(updated.map(async (product) => {
      await shopifyClient.updateProduct(product.product.id, product);
      await delay(500);
    }));
  }

  // Procesar productos eliminados
  if (deleted && deleted.length > 0) {
    await Promise.all(deleted.map(async (productId) => {
      await shopifyClient.deleteProduct(productId);
      await delay(500);
    }));
  }
};

