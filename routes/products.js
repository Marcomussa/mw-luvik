const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')

router.post('/batch', productController.handleBatch)

router.post('/update-stock/:id/:newStock', productController.updateProductStock)

router.post('/update-stock-v2/:id/:newStock', productController.updateProductStockV2)

router.get('/list-by-id/:id', productController.listProductByID)

router.get('/list', productController.listProducts)

router.get('/list-collections', productController.listCollections)

router.get("/list-products-with-collections", productController.getProductsWithCollections)

router.get('/get-id-by-name/:name', productController.listProductIDsByName)

router.get("/count",  productController.countProducts)

router.get('/list-without-metafields', productController.listProductsWithMissingMetafields)

router.post('/update-stock-and-price/:id/:lumps/:newStock/:price/:compare_at_price?', productController.updateProductStockAndPrice)

module.exports = router