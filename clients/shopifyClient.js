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
    
    products.forEach(product => {
      console.log(`ID: ${product.id}, Title: ${product.title}, Price: ${product.variants[0].price}`)
    })

    return products
  } catch (error) {
    console.log(error.message)
    throw error.message
  }
}

exports.listProductByID = async (productId) => {
  try {
    const response = await axios.get(`${SHOPIFY_STORE_URL}/products/${productId}.json`, { headers })
    return response.data.product
  } catch (error) {
    console.error('Error al obtener los detalles del producto:', error.message)
    throw error
  }
}

exports.listProductsWithMetafields = async () => {
  try {
    // Fetch all products
    const response = await axios.get(`${SHOPIFY_STORE_URL}/products.json`, { headers });
    const products = response.data.products;

    // Fetch metafields for each product
    const productDetails = await Promise.all(products.map(async product => {
      const metafieldsResponse = await axios.get(`${SHOPIFY_STORE_URL}/products/${product.id}/metafields.json`, { headers });
      return {
        ...product,
        metafields: metafieldsResponse.data.metafields
      }
    }));

    // Log product details including metafields
    productDetails.forEach(product => {
      console.log(`ID: ${product.id}, 
                  Title: ${product.title}, 
                  Price: ${product.variants[0].price}, 
                  Metafields: ${JSON.stringify(product.metafields, null, 2)}`
                  // Additional properties can be added here...
                  );
    });

    return productDetails;
  } catch (error) {
    console.error('Error fetching products or metafields:', error);
    throw new Error('Error fetching products or metafields');
  }
}

exports.getProductIDsByName = async (productName) => {
  try {
    const response = await shopify.product.list()
    const products = response

    const sanitizedProductName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s_-]');
    const productRegex = new RegExp(sanitizedProductName, 'i');

    // Evaluar Coincidencias
    const matchedProducts = products.filter(product => productRegex.test(product.title));

    if (matchedProducts.length > 0) {
      return matchedProducts.map(product => ({
        id: product.id,
        title: product.title
        // Demas datos que se quieran mostrar
      }))
    } else {
      return `No se encontraron productos que coincidan con el nombre: ${productName}`
    }
  } catch (error) {
    console.error(error.message)
    throw new Error('Error al obtener los IDs de los productos.')
  }
}

const assignProductToCollection = async (productId, collectionId) => {
  try {
    const collectData = {
      collect: {
        product_id: productId,
        collection_id: collectionId
      }
    }

    const response = await axios.post(`${SHOPIFY_STORE_URL}/collects.json`, collectData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error asignando el producto a la colección:', error.message);
    throw error;
  }
}

//todo
exports.listCollections = async () => {
  try {
    const response = await axios.get(`${SHOPIFY_STORE_URL}/collection_listings.json`, { headers })
    const collections = response.data.collections

    console.log(collections)

  } catch (error) {
    console.error('Error fetching collections:', error)
    throw new Error('Error fetching collections')
  }
}

exports.createProduct = async (productData) => {
  //TODO: Pasar la coleccion como nombre y no como id
  try {
    productData.product.images = [{}]
    productData.product.images[0].src = `https://cdn.shopify.com/s/files/1/0586/0117/7174/files/${productData.product.variants[0].sku}?v=1721305623`

    const response = await axios.post(`${SHOPIFY_STORE_URL}/products.json`, productData, { headers })
    const productId = response.data.product.id

    await assignProductToCollection(productId, productData.product.collection)

    return response.data
  } catch (error) {
    console.log('Error Creando Producto. shopifyClient. ', error.message)
    throw error
  }
}

exports.updateProduct = async (id, productData) => {
  try {
    // Crear el producto
    const response = await axios.put(`${SHOPIFY_STORE_URL}/products/${id}.json`, productData, { headers })
    const productId = response.data.product.id

    //TODO: Logica de agregado de colecciones

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

//TODO: (Shopify Webhook)
exports.updateProductStockWebhook = async () => {
  
}

exports.deleteProduct = async (id) => {
  await axios.delete(`${SHOPIFY_STORE_URL}/products/${id}.json`, { headers })
}

// AUX:
const addPriceMetafields = async (productId, unitPerBult) => {
  try {
    const metafieldData = {
      namespace: 'bult',
      key: 'units_per_bult',
      value: unitPerBult.toString(),
      type: 'number_decimal'
    }

    const response = await axios.post(
      `${SHOPIFY_STORE_URL}/products/${productId}/metafields.json`,
      { metafield: metafieldData },
      { headers }
    )

    return response.data
  } catch (error) {
    console.log('Error Agregando Metafield. Shopifyclient ', error.message)
    throw error
  }
}

//* -- -- Customers -- -- */
exports.listUsers = async () => {
  const response = await axios.get(`${SHOPIFY_STORE_URL}/customers.json`, { headers })
  return response.data
}

exports.getUserByID = async (userId) => {
  const response = await axios.get(`${SHOPIFY_STORE_URL}/customers/${userId}.json`, { headers })
  return response.data
}

exports.getUserIDByName = async (customerName) => {
  try {
    const response = await shopify.customer.list()
    const customer = response

    const sanitizedCustomertName = customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s_-]');
    const productRegex = new RegExp(sanitizedCustomertName, 'i');

    // Evaluar Coincidencias
    const matchedCustomers = customer.filter(customer => productRegex.test(customer.first_name));

    if (matchedCustomers.length > 0) {
      return matchedCustomers.map(customer => ({
        id: customer.id,
        title: customer.first_name
        // Demas datos que se quieran mostrar
      }))
    } else {
      return `No se encontraron clientes que coincidan con el nombre: ${customerName}`
    }
  } catch (error) {
    console.error(error.message)
    throw new Error(`Error al obtener los ID de ${customerName}`)
  }
}

//TODO
exports.updateUser = async (userId, userData) => {
  console.log(...userData)
  try {
    const response = await axios.put(`${SHOPIFY_STORE_URL}/customers/${userId}.json`, { 
      customer: {
        id: userId,
        ...userData
      }}, {
      headers
    })
    console.log(`Usuario ${userId} Actualizado Correctamente`)
    return response.data
  } catch (error) {
    console.log(`Error Actualizando Usuario, ID: ${userId}`)
  }
}

exports.deleteUser = async (userId) => {
  const response = await axios.delete(`${SHOPIFY_STORE_URL}/customers/${userId}.json`, { headers })
  return response.data
}
 
//* -- -- Order -- -- */