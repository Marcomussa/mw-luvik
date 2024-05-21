const axios = require('axios');
const SHOPIFY_STORE_URL = `https://${process.env.SHOPIFY_STORE_URL}/admin/products.json`
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY 
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY 
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

const headers = {
    'Content-Type': 'application/json',
    '6e169eac360293c61f1ab3b856359293': `${SHOPIFY_API_SECRET_KEY}`,
    'X-Shopify-Access-Token': `${SHOPIFY_ACCESS_TOKEN}`
};

exports.createProduct = async (productData) => {
  const response = await axios.post(SHOPIFY_STORE_URL, productData, { headers });
  return response.data;
};

exports.updateProduct = async (id, productData) => {
  const response = await axios.put(`${SHOPIFY_STORE_URL}/${id}`, productData, { headers });
  return response.data;
};

exports.deleteProduct = async (id) => {
  await axios.delete(`${SHOPIFY_STORE_URL}/${id}`, { headers });
};
