const productService = require('../services/productService')
const shopifyClient = require('../clients/shopifyClient')
const mongoose = require('mongoose');

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
    res.status(500).json({ message: error})
    console.log('Error en Batch (Productos). productController.js')
    console.log(error.message)
  }
}

exports.listProducts = async (req, res) => {
  try {
    const response = await shopifyClient.listProducts()
    res.status(200).json(response)
  } catch (error) {
    console.log('Error Listando Productos. productController.js', error.message)
  }
}

exports.getProductsWithCollections = async (req, res) => {
  try {
    const response = await shopifyClient.getProductsWithCollections()
    res.status(200).json(response)
  } catch (error) {
    console.log('Error Listando Productos con Colecciones. productController.js', error.message)
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

const collectionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
});

const Collection = mongoose.model('Collection', collectionSchema, "collections");

exports.postCollectionsToDB = async (req, res) => {
  try {
    const response = await shopifyClient.listCollections();
    const collections = response;
    
    await Collection.deleteMany({});
    await Collection.insertMany(collections, { ordered: false }); 

    console.log(`Colecciones insertadas correctamente.`);
  } catch (error) {
    console.error('Error guardando colecciones en la base de datos:', error);
  }
};

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