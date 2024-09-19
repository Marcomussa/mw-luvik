require('dotenv').config()
const axios = require('axios')
const Shopify = require('shopify-api-node')
const XLSX = require('xlsx');
const fs = require('fs');

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
    let allProducts = [];
    let hasMoreProducts = true;
    let lastId = null; 

    while (hasMoreProducts) {
      const params = {
        limit: 250,
      };

      if (lastId) {
        params.since_id = lastId;
      }

      const products = await shopify.product.list(params);
      
      allProducts = allProducts.concat(products); 

      if (products.length < 250) {
        hasMoreProducts = false;
      } else {
        lastId = products[products.length - 1].id;
      }
    }

    const productDetails = allProducts.map(product => ({
      id: product.id,
      title: product.title,
      sku: product.variants[0].sku
    }));

    return {
      success: true,
      data: productDetails
    };
  } catch (error) {
    console.error(`Error Listando Productos. productController.js: ${error.message}`);

    // Lanzar un error con un mensaje claro
    throw {
      success: false,
      message: `Error Listando Productos. productController.js: ${error.message}`
    };
  }
};


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
      console.log(`ID: ${product.id}, Title: ${product.title}, Price: ${product.variants[0].price}, Metafields: ${JSON.stringify(product.metafields, null, 2)}`)
    })

    return productDetails;
  } catch (error) {
    console.error('Error fetching products or metafields:', error)
    throw new Error('Error fetching products or metafields')
  }
}

exports.listCollections = async () => {
  try {
    let allCollections = [];
    let params = { limit: 250 };

    do {
      const customCollections = await shopify.customCollection.list(params);
      allCollections = allCollections.concat(customCollections);
      params = customCollections.nextPageParameters;
    } while (params !== undefined);

    const workbook = XLSX.utils.book_new();

    const data = [['Title', 'ID']]; 

    allCollections.forEach(collection => {
      console.log(`ID: ${collection.id}, Name: ${collection.title}`);

      data.push([collection.title, collection.id]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Collections');

    console.log(allCollections.length);

    XLSX.writeFile(workbook, 'collections.xlsx');

    return allCollections;
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    throw new Error('Error fetching collections');
  }
};

exports.listProductIDsByName = async (productName) => {
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

//todo: Implementar validacion de producto existente
exports.createProduct = async (productData) => {
  try {
    productData.product.images = [{
      src: `https://cdn.shopify.com/s/files/1/0586/0117/7174/files/${productData.product.variants[0].sku}.jpg`
    }]

    // No existe oferta
    if (productData.product.lumps) {
      productData.product.variants[0].price = productData.product.variants[0].price * productData.product.lumps
    }

    // Existe oferta
    if (productData.product.lumps && productData.product.variants[0].compare_at_price) {
      productData.product.variants[0].compare_at_price = productData.product.variants[0].compare_at_price * productData.product.lumps
    }

    const response = await axios.post(`${SHOPIFY_STORE_URL}/products.json`, productData, { headers })
    const productId = response.data.product.id

    // Asignacion automatica de coleccion oferta
    if (productData.product.lumps && productData.product.variants[0].compare_at_price) {
      await assignProductToCollections(productId, [282433814614])
    }

    if (productData.product.collection && productData.product.collection.length > 0) {
      await assignProductToCollections(productId, productData.product.collection)
    }

    if (productData.product.lumps) {
      await addBultMetafield(productId, productData.product.lumps)
    }

    return response.data
  } catch (error) {
    console.log('Error Creando Producto. shopifyClient. ', error.message)
    throw error
  }
}

exports.updateProduct = async (id, productData) => {
  try {
    // No existe oferta
    if (productData.product.lumps) {
      productData.product.variants[0].price = productData.product.variants[0].price * productData.product.lumps
    }

    // Existe oferta
    if (productData.product.lumps && productData.product.variants[0].compare_at_price) {
      productData.product.variants[0].compare_at_price = productData.product.variants[0].compare_at_price * productData.product.lumps
    }

    const response = await axios.put(`${SHOPIFY_STORE_URL}/products/${id}.json`, productData, { headers })
    const productId = response.data.product.id

    // Coleccion de Oferta
    const isCollectionInProduct = await checkIfCollectionIsOnProduct(productId, 282433814614)

    if (!isCollectionInProduct && productData.product.variants[0].compare_at_price) {
      await assignProductToCollections(productId, [282433814614])
    } 

    if (isCollectionInProduct && !productData.product.variants[0].compare_at_price) {
      await removeProductFromCollections(productId, [282433814614])
    } 

    if (productData.product.newCollection && productData.product.newCollection.length > 0) {
      await assignProductToCollections(productId, productData.product.newCollection)
    }

    if (productData.product.deleteCollection && productData.product.deleteCollection.length > 0) {
      await removeProductFromCollections(productId, productData.product.deleteCollection)
    }

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

//! Checkiar si un producto ya existe. TODO!!!
const checkIfProductIsCreated = async (sku) => {
  try {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const products = await shopifyClient.product.list();

    for (const product of products) {
      const variant = product.variants.find(variant => variant.sku === sku);
      if (variant) {
        console.log(`Producto con SKU ${sku} ya existe. ID de producto: ${product.id}`);
        return true; 
      }
      await delay(250)
    }
    console.log(`Producto con SKU ${sku} no existe.`);
    return false; 

  } catch (error) {
    console.log('Error al verificar si el producto existe: ', error.message);
    throw error;
  }
};

//! Asignar Colecciones
const assignProductToCollections = async (productId, newCollectionIds) => {
  console.log(`Producto ID: ${productId}`);
  console.log('Colecciones:', newCollectionIds);

  try {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const collectionId of newCollectionIds) {
      console.log(`Asignando producto ${productId} a colección ${collectionId}`);
      try {
        const isCollectionInProduct = await checkIfCollectionIsOnProduct(productId, collectionId)
        await delay(500);  // Aumentar el delay a 500ms

        if(!isCollectionInProduct){
          const response = await shopify.collect.create({
            product_id: productId,
            collection_id: collectionId
          });
          console.log(`Asignado exitosamente a colección ${collectionId}`, response);
        } else {
          console.log(`Producto ya existente en coleccion ${collectionId}`)
        }

      } catch (err) {
        console.log(`Error al asignar a colección ${collectionId}:`, err.response ? err.response.data : err.message);
        throw err;
      }
      await delay(500);  // Aumentar el delay a 500ms
    }
  } catch (error) {
    console.log('Error asignando producto a colecciones:', error.message);
    throw error;
  }
};


//! Checkiar si una coleccion ya esta en un producto
const checkIfCollectionIsOnProduct = async (productId, collectionId) => {
  try {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const customCollections = await shopify.customCollection.list({ product_id: productId });
    const isInCollection = customCollections.some(
      (collection) => collection.id.toString() === collectionId.toString()
    );

    await delay(500)

    return isInCollection;
  } catch (error) {
    console.error('Error al consultar el producto:', error.message);
    return false; 
  }
}

//! Eliminar Colecciones
const removeProductFromCollections = async (productId, collectionIdsToRemove) => {
  try {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const collectionId of collectionIdsToRemove) {
      const collects = await shopify.collect.list({
        product_id: productId,
        collection_id: collectionId
      });

      if (collects.length > 0) {
        await shopify.collect.delete(collects[0].id);
        console.log(`Eliminado de la colección ${collectionId}`);
      } else {
        console.log(`No se encontró relación para eliminar entre el producto ${productId} y la colección ${collectionId}`);
      }

      await delay(250);
    }
  } catch (error) {
    console.log('Error Eliminando Producto de Colecciones: ', error.message);
    throw error;
  }
};

//! Crea un nuevo metafield y asigna el valor asociado para cada producto "bultos.custom". NO matchea con el metafield ya existente
const addBultMetafield = async (productId, unitsPerBult) => {
  try {
    const metafieldData = {
      namespace: 'bultos',
      key: 'custom',
      value: unitsPerBult,
      type: 'number_decimal'
    }

    const response = await axios.post(`${SHOPIFY_STORE_URL}/products/${productId}/metafields.json`,
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
  try {
    const customers = await shopify.customer.list();
    const customersWithMetafields = await Promise.all(customers.map(async customer => {
      const metafields = await shopify.metafield.list({ metafield: { owner_resource: 'customer', owner_id: customer.id } });
      return { 
        ...customer, 
        metafields 
      };
    }));
    return customersWithMetafields;
  } catch (error) {
    console.error(error);
    throw error;
  }
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

exports.updateUser = async (userId, userData) => {
  try {
    const existingUser = await shopify.customer.get(userId);

    const updatedUserData = {
      ...existingUser,
      ...userData
    }

    const response = await shopify.customer.update(userId, updatedUserData);

    return response;
  } catch (error) {
    console.error('Error actualizando el usuario:', error.message)
    throw new Error('Error actualizando el usuario')
  }
}

exports.deleteUser = async (userId) => {
  const response = await axios.delete(`${SHOPIFY_STORE_URL}/customers/${userId}.json`, { headers })
  return response.data
}
 
//* -- -- Order -- -- */