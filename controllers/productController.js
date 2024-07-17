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
    const response = await shopifyClient.listProducts()
    res.status(200).json(response)
  } catch (error) {
    console.log('Error Listando Productos. productController.js', error.message)
  }
}

exports.getProductIDsByName = async (req, res) => {
  const { name } = req.params
  try {
    const response = await shopifyClient.getProductIDsByName(name)
    res.status(200).json(response)
  } catch (error) {
    console.log(`Error Obteniendo ID de ${name}. productController.js`, error.message)
  }
}

//* PRE: El Producto Debe Tener Seguimiento Activado
//* "inventory_management" = "shopify"
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