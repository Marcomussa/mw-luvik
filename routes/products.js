const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')

router.post('/batch', productController.handleBatch)

router.post('/update-stock/:id/:newStock', productController.updateProductStock)

router.get('/list-by-id/:id', productController.listProducts)

router.get('/list', productController.listProducts)

router.get('/list-collections', productController.listCollections)

router.get('/get-id-by-name/:name', productController.listProductIDsByName)

module.exports = router