const axios = require('axios');
const Shopify = require('shopify-api-node');

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
});

exports.listProducts = async () => {
  shopify.product.list()
  .then(products => {
    console.log(`Total products: ${products.length}`);
    console.log('Product details:');

    //* Iterar Productos
    //? products.forEach(product => {
    //?   console.log(`ID: ${product.id}, Title: ${product.title}`);
    //? });

    //! Acceso Para Modificar Stock
    products.forEach( product => {
      console.log(product.variants[0].inventory_quantity)
    })
  })
  .catch(err => {
    console.error(err);
  });
}

exports.createProduct = async (productData) => {
  const response = await axios.post(`${SHOPIFY_STORE_URL}/products.json`, productData, { headers })
  return response.data
}

exports.updateProduct = async (id, productData) => {
  const response = await axios.put(`${SHOPIFY_STORE_URL}/products/${id}.json`, productData, { headers })
  return response.data
}

exports.updateProductStock = async (id, productData) => {
  // Completar
}

exports.deleteProduct = async (id) => {
  await axios.delete(`${SHOPIFY_STORE_URL}/products/${id}.json`, { headers })
}
