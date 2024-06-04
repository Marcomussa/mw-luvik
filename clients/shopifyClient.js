require('dotenv').config()
const axios = require('axios')
const Shopify = require('shopify-api-node')

const SHOPIFY_STORE_URL = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-04`
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY 
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY 
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

const headers = {
    'Content-Type': 'application/json',
    '6e169eac360293c61f1ab3b856359293': SHOPIFY_API_SECRET_KEY,
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
}

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_URL,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: SHOPIFY_ACCESS_TOKEN,
  autoLimit: true,
})

//* -- -- Product -- -- */
exports.listProducts = async () => {
  try {
    const products = await shopify.product.list()
    const productDetails = await Promise.all(products.map(async product => {
      const metafields = await axios.get(`${SHOPIFY_STORE_URL}/products/${product.id}/metafields.json`, { headers })
      return {
        ...product,
        metafields: metafields.data.metafields
      }
    }))

    productDetails.forEach(product => {
      const businessPrice = product.metafields.find(field => field.key === 'business_price')
      console.log(`ID: ${product.id}, 
                  Title: ${product.title}, 
                  Price: ${product.variants[0].price}, 
                  Business Price: ${businessPrice ? businessPrice.value : 'N/A'}`
                  // Demas Propiedades a Buscar...
                  )
    })

    return productDetails
  } catch (error) {
    console.log(error.message)
    throw error.message
  }
}

exports.createProduct = async (productData) => {
  try {
    const response = await axios.post(`${SHOPIFY_STORE_URL}/products.json`, productData, { headers })
    const productId = response.data.product.id
    const businessPrice = productData.product.business_price

    // Esto Agrega precio para empresas como un metafield
    await addPriceMetafields(productId, businessPrice)

    return response.data
  } catch (error) {
    console.log('Error Creando Producto. shopifyClient. ', error.message)
    throw error
  }
}

const addPriceMetafields = async (productId, priceForBusiness) => {
  try {
    const metafieldData = {
      namespace: 'custom_prices',
      key: 'business_price',
      value: priceForBusiness.toString(),
      type: 'number_decimal'
    }

    const response = await axios.post(
      `${SHOPIFY_STORE_URL}/products/${productId}/metafields.json`,
      { metafield: metafieldData },
      { headers }
    )

    return response.data
  } catch (error) {
    console.log('Error Agregando Metafield de Precio. Shopifyclient ', error.message)
    throw error
  }
}

exports.updateProduct = async (id, productData) => {
  try {
    // Crear el producto
    const response = await axios.put(`${SHOPIFY_STORE_URL}/products/${id}.json`, productData, { headers })
    const productId = response.data.product.id
    const businessPrice = productData.product.business_price // Agrega este campo en tu `productData`

    // Agregar precio para empresas como un metafield
    await addPriceMetafields(productId, businessPrice)

    return response.data
  } catch (error) {
    console.log('Error Actualizando Producto. Shopifyclient ', error.message)
    throw error
  }
}

exports.updateProductStock = async (id, newStock) => {
  try {
    // Obtener el ID del item de inventario y location_id
    const product = await axios.get(`${SHOPIFY_STORE_URL}/products/${id}.json`, { headers })
    const inventoryItemId = product.data.product.variants[0].inventory_item_id

    // Obtener todas las locations de la tienda
    const locationsResponse = await axios.get(`${SHOPIFY_STORE_URL}/locations.json`, { headers })
    const locationId = locationsResponse.data.locations[0].id

    // Actualizar el inventario
    const inventoryUpdateResponse = await axios.post(
      `${SHOPIFY_STORE_URL}/inventory_levels/set.json`,
      {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: newStock
      },
      { headers }
    )

    return inventoryUpdateResponse.data
  } catch (error) {
    console.error('Error actualizando stock. shopifyClient ', error.message)
    throw error
  }
}

exports.deleteProduct = async (id) => {
  await axios.delete(`${SHOPIFY_STORE_URL}/products/${id}.json`, { headers })
}


//* -- -- Customers -- -- */
exports.listUsers = async () => {
  const response = await axios.get(`${SHOPIFY_STORE_URL}/customers.json`, { headers })
  return response.data
}

exports.listUserByID = async (userId) => {
  const response = await axios.get(`${SHOPIFY_STORE_URL}/customers/${userId}.json`, { headers })
  return response.data
}

exports.deleteUser = async (userId) => {
  const response = await axios.delete(`${SHOPIFY_STORE_URL}/customers/${userId}.json`, { headers })
  return response.data
}