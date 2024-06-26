const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')

router.post('/batch', productController.handleBatch)

router.post('/update-stock/:id/:newStock', productController.updateProductStock)

router.get('/list', productController.listProducts)

module.exports = router