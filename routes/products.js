const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')

router.post('/batch', productController.handleBatch)

router.post('/update-stock/:id/:newStock', productController.updateProductStock)

router.get('/list-by-id/:id', productController.listProducts)

router.get('/list', productController.listProducts)

router.get('/list-collections', productController.listCollections)

router.get("/list-products-with-collections", productController.getProductsWithCollections)

router.get('/get-id-by-name/:name', productController.listProductIDsByName)

router.get("/count",  productController.countProducts)

router.get('/list-without-metafields', productController.listProductsWithMissingMetafields)

module.exports = router