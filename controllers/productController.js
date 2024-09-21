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

    console.log(`Colecciones insertadas correctamente.`);
  } catch (error) {
    console.error('Error guardando producto en la base de datos:', error);
  }
};

exports.postProductToDB = async (response, collection) => {
  try {
    const productId = response.product.id
    const productTitle = response.product.title
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

//TODO
exports.updateProductToDB = async (response, collection) => {
  
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