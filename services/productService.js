const shopifyClient = require('../clients/shopifyClient');

exports.handleBatch = async (created, updated, deleted) => {
  // Procesar productos creados
  if (created && created.length > 0) {
    await Promise.all(created.map(async (product) => {
      await shopifyClient.createProduct(product);
    }));
  }

  // Procesar productos actualizados
  if (updated && updated.length > 0) {
    await Promise.all(updated.map(async (product) => {
      await shopifyClient.updateProduct(product.product.id, product);
    }));
  }

  // Procesar productos eliminados
  if (deleted && deleted.length > 0) {
    await Promise.all(deleted.map(async (productId) => {
      await shopifyClient.deleteProduct(productId);
    }));
  }
};

