require('dotenv').config()
const express = require("express")
const axios = require("axios")
const bodyParser = require("body-parser")
const productRoutes = require('./routes/products');
const app = express()
const PORT = 3000

app.use(bodyParser.json())
app.use('/products', productRoutes);


const ERP_API_URL = process.env.ERP_API_URL
const ERP_API_KEY = process.env.ERP_API_KEY

const SHOPIFY_STORE_NAME = process.env.SHOPIFY_STORE_NAME
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN
const SHOPIFY_PASSWORD = process.env.SHOPIFY_PASSWORD

//!!! NO ES NECESARIO. NO SE BORRA  XLAS DUDAS
//! Endpoint para obtener inventario desde el ERP
app.get('/productos-erp', async (req, res) => {
    try {
        const response = await axios.get('URL_DEL_ERP/api/productos')
        const products = response.data
        res.json(products)
    } catch (error) {
        console.error(error)
        res.status(500).json({ 
            error: 'Error al leer productos del ERP', errCode: error
        })
    }
})

//! Endpoint para actualizar todo el inventario en Shopify
app.post('/sync-products', async (req, res) => {
    try {
      const response = await axios.get('https://erp.example.com/api/products')
      const products = response.data
  
      for (const product of products) {
        const shopifyProduct = {
          title: product.name,
          //! Resto de la informacion
        }
  
        await shopify.post('/products.json', { product: shopifyProduct })
      }

      res.json({ message: 'Productos sincronizados con éxito' })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: 'Error al sincronizar productos', errCode: error
        })
    }
})

//todo: Metodo Para Actualizar Datos de Productos Seleccionados
async function getProductFromERP(id) {
    const response = await axios.get(`https://erp-url.com/products/${id}`)
    return response.data
}

async function updateProductInShopify(shopifyProductId, updatedProduct) {
    const response = await axios.put(`https://${SHOPIFY_DOMAIN}/admin/api/2022-01/products/${shopifyProductId}.json`, {
      product: {
        title: updatedProduct.name,
        //! Resto de la informacion
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
      }
    })
  
    return response.data.product
}

app.post('/update-selected-products', async (req, res) => {
    const productsToUpdate = req.body.products
    const updatedProducts = []
  
    for (const product of productsToUpdate) {
      try {
        const erpProduct = await getProductFromERP(product.id)
  
        const shopifyProduct = await updateProductInShopify(product.shopifyId, erpProduct)
  
        updatedProducts.push(shopifyProduct)
      } catch (error) {
        console.error(`Error Actualizando Producto: ${product.id}:`, error.message)
      }
    }
  
    res.json(updatedProducts)
})


//! SERVER
app.listen(PORT, () => {
    console.log(`Servidor en Linea. Puerto: ${PORT}`)
})