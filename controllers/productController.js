const productService = require('../services/productService');

exports.handleBatch = async (req, res) => {
  try {
    const { created, updated, deleted } = req.body;
    await productService.handleBatch(created, updated, deleted);
    res.status(200).json({ message: 'Batch Ok' });
  } catch (error) {
    res.status(500).json({ message: 'osea hellou' });
  }
};
