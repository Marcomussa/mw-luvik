const productService = require('../services/productService')
const shopifyClient = require('../clients/shopifyClient')
const Product = require("../models/Product")
const Collection = require("../models/Collection")
const mongoose = require('mongoose');


exports.postCollectionsToDB = async () => {
  try {
    const response = await shopifyClient.listCollections();
    const collections = response;

    await Collection.deleteMany({});
    await Collection.insertMany(collections, { ordered: false });

  } catch (error) {
    console.error('Error guardando producto en la base de datos:', error);
  }
};

exports.postProductToDB = async (product, collection) => {
  try {
    const productId = product.id
    const productTitle = product.title
    const collections = collection.map(id => ({
      id: id
    }));

    const newProduct = new Product({
      id: productId,
      title: productTitle,
      collections: collections
    });

    await newProduct.save();

    console.log(`Producto ${productTitle} insertado correctamente en DB.`);
  } catch (error) {
    console.error('Error guardando colecciones en la base de datos:', error);
  }
};

exports.updateProductToDB = async (product) => {
  try {
    const productId = product.product.id
    const newCollection = product.product.newCollection
    const deleteCollection = product.product.deleteCollection

    const existingProduct = await Product.findOne({ id: productId });

    if (!existingProduct) {
      console.error(`Producto con ID ${productId} no encontrado.`);
      return;
    }

    if (newCollection && newCollection.length > 0) {
      await Product.updateOne(
        { id: productId },
        {
          $addToSet: {
            collections: {
              $each: newCollection.map(id => ({ id }))
            }
          }
        }
      );
    }

    if (deleteCollection && deleteCollection.length > 0) {
      await Product.updateOne(
        { id: productId },
        {
          $pull: {
            collections: {
              id: {
                $in: deleteCollection
              }
            }
          }
        }
      );
    }

    console.log(`Producto ${productId} Actualizado Correctamente en DB.`);
  } catch (error) {
    console.error('Error guardando colecciones en la base de datos:', error);
  }
};

exports.deleteProductFromDB = async (productId) => {
  try {
    const result = await Product.deleteOne({ id: productId });

    if (result.deletedCount === 0) {
      console.log(`No se encontró un producto con ID ${productId}.`);
    } else {
      console.log(`Producto con ID ${productId} eliminado correctamente.`);
    }
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${productId}:`, error);
  }
};

exports.handleBatch = async (req, res) => {
  try {
    const { created, updated, deleted } = req.body
    const createdProductIds = await productService.handleBatch(created, updated, deleted);

    // Determina si se han creado nuevos productos para incluir en la respuesta
    const response = {
      message: 'Batch Ok'
    };

    if (created && created.length > 0) {
      response.createdProductIds = createdProductIds;
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error })
    console.log('Error en Batch (Productos). productController.js')
    console.log(error.message)
  }
}

exports.listProducts = async (req, res) => {
  try {
    const response = await shopifyClient.listProducts()
    console.log(response.data.length)
    res.status(200).json(response)
  } catch (error) {
    console.log('Error Listando Productos. productController.js', error.message)
  }
}

exports.getProductsWithCollections = async (req, res) => {
  try {
    const response = await shopifyClient.getProductsWithCollections()
    for (let i = 0; i < response.length; i++) {
      const productId = response[i].id
      const productTitle = response[i].title
      const collections = response[i].collections.map(collection => ({
        id: collection.id, // Extrae solo el ID de la colección
        title: collection.title // Extrae solo el título de la colección
      }));

      const newProduct = new Product({
        id: productId,
        title: productTitle,
        collections: collections
      });

      await newProduct.save();
    }

    res.status(200).json(response)
  } catch (error) {
    console.log('Error Listando Productos con Colecciones. productController.js', error.message)
  }
}

async function countProducts() {
  try {
    const productCountInDb = await Product.countDocuments();
    const productCountInShopify = await shopifyClient.getTotalProducts()

    console.log("DB:", productCountInDb)
    console.log("Shopify:", productCountInShopify)

    return { productCountInDb, productCountInShopify }
  } catch (error) {
    console.error('Error counting products:', error);
  }
}

exports.countProducts = async () => {
  try {
    const productCount = await countProducts()
    return productCount
  } catch (error) {
    console.error('Error counting products:', error);
  }
}


exports.listProductByID = async (req, res) => {
  const { id } = req.params
  try {
    const response = await shopifyClient.listProductByID(id)
    res.status(200).json(response)
  } catch (error) {
    console.log('Error Listando Productos. productController.js', error.message)
  }
}

exports.listProductIDsByName = async (req, res) => {
  const { name } = req.params
  try {
    const response = await shopifyClient.listProductIDsByName(name)
    res.status(200).json(response)
  } catch (error) {
    console.log(`Error Obteniendo ID de ${name}. productController.js`, error.message)
  }
}

exports.listCollections = async (req, res) => {
  try {
    const response = await shopifyClient.listCollections()
    res.status(200).json(response)
  } catch (error) {
    console.log('Error Listando Productos. productController.js', error.message)
  }
}

//! "inventory_management" = "shopify"
exports.updateProductStock = async (req, res) => {
  try {
    const { id, newStock } = req.params
    const newStockParsed = parseInt(newStock, 10); // Convertir newStock a número
    const response = await shopifyClient.updateProductStock(id, newStockParsed)
    res.status(200).json(response)
  } catch (error) {
    console.log('Error Actualizando Stock. productController.js', error.message)
    res.status(500).json({ error: error.message })
  }
}