const productService = require('../services/productService');
const shopifyClient = require('../clients/shopifyClient')


exports.handleBatch = async (req, res) => {
  try {
    const { created, updated, deleted } = req.body;
    await productService.handleBatch(created, updated, deleted);
    res.status(200).json({ message: 'Batch Ok' });
  } catch (error) {
    res.status(500).json({ message: error})
    console.log(error.message)
  }
};

exports.listProducts = async (req, res) => {
  try {
    await shopifyClient.listProducts()
    res.status(200)
  } catch (error) {
    console.log(error.message)
    throw error
  }
}