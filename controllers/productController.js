const productService = require('../services/productService')
const shopifyClient = require('../clients/shopifyClient')


exports.handleBatch = async (req, res) => {
  try {
    const { created, updated, deleted } = req.body
    await productService.handleBatch(created, updated, deleted)
    res.status(200).json({ message: 'Batch Ok' })
  } catch (error) {
    res.status(500).json({ message: error})
    console.log('Error en Batch (Productos). productController.js')
    console.log(error.message)
  }
}

exports.listProducts = async (req, res) => {
  try {
    await shopifyClient.listProducts()
    res.status(200)
  } catch (error) {
    console.log('Error Listando Productos. productController.js', error.message)
  }
}

exports.updateProductStock = async (req, res) => {
  try {
    const { productId, newStock } = req.body 
    const result = await shopifyClient.updateProductStock(productId, newStock)
    res.status(200).json(result)
  } catch (error) {
    console.log('Error Actualizando Stock. productController.js', error.message)
    res.status(500).json({ error: error.message })
  }
}