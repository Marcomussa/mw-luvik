require("dotenv").config();
const axios = require("axios");
const Shopify = require("shopify-api-node");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const LogErrorProduct = require("../models/LogErrorProduct");
const productController = require("../controllers/productController");

const SHOPIFY_STORE_URL = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-04`;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const ROUTE = process.env.ROUTE;

const headers = {
  "Content-Type": "application/json",
  "6e169eac360293c61f1ab3b856359293": SHOPIFY_API_SECRET_KEY,
  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
};

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_URL,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: SHOPIFY_ACCESS_TOKEN,
  autoLimit: {
    calls: 38, // 95% del límite de 40 llamadas por segundo
    interval: 1000, // 1 segundo de intervalo (1000 ms)
    bucketSize: 80, // Tamaño máximo del bucket según el sistema de Shopify
  },
});

//* -- -- Product -- -- */
exports.getTotalProducts = async () => {
  try {
    const response = await axios.get(
      `${SHOPIFY_STORE_URL}/products/count.json`,
      { headers }
    );
    return response.data.count;
  } catch (error) {
    console.error("Error fetching product count from Shopify:", error.message);
  }
};

exports.listProducts = async () => {
  try {
    let allProducts = [];
    let hasMoreProducts = true;
    let nextPageInfo = null;

    while (hasMoreProducts) {
      const params = {
        limit: 250,
      };

      if (nextPageInfo) {
        params.page_info = nextPageInfo;
      }

      const response = await shopify.product.list(params);
      const products = response.products || response;

      allProducts = allProducts.concat(products);

      if (response.nextPageParameters) {
        nextPageInfo = response.nextPageParameters.page_info;
      } else {
        hasMoreProducts = false;
      }
    }

    //! Filtro Personalizado
    // const filteredProducts = allProducts.filter(product => {
    //   return product.variants.some(variant => variant.sku === "");
    // });

    const productDetails = await Promise.all(
      allProducts.map(async (product) => {
        try {
          //! Obtener metacampos para cada producto
          // const metafields = await shopify.metafield.list({
          //   metafield: {
          //     owner_resource: "product",
          //     owner_id: product.id,
          //   },
          // });
          //const metafields = [{}];

          console.log(product.id);
          return {
            id: product.id,
            //lumps: metafields[0].value ? metafields[0].value : 0,
            //title: product.title,
            //tags: product.tags,
            vendor: product.vendor,
            //sku: product.variants[0].sku,
            // variants: [{
            // sku: product.variants[0].sku,
            // inventory_management: product.variants[0].inventory_management,
            // inventory_quantity: product.variants[0].inventory_quantity,
            // price: product.variants[0].price,
            // compare_at_price: product.variants[0].compare_at_price
            // }],
          };
        } catch (error) {
          console.error("Error", product.id);
        }
      })
    );

    return {
      success: true,
      data: productDetails,
    };
  } catch (error) {
    console.error(
      `Error Listando Productos. productController.js: ${error.message}`
    );
    throw {
      success: false,
      message: `Error Listando Productos. productController.js: ${error.message}`,
    };
  }
};

exports.listProductByID = async (productId) => {
  try {
    const response = await axios.get(
      `${SHOPIFY_STORE_URL}/products/${productId}.json`,
      { headers }
    );
    return response.data.product;
  } catch (error) {
    console.error("Error al obtener los detalles del producto:", error.message);
    throw error;
  }
};

exports.listProductsWithMetafields = async () => {
  try {
    // Fetch all products
    const response = await axios.get(`${SHOPIFY_STORE_URL}/products.json`, {
      headers,
    });
    const products = response.data.products;

    // Fetch metafields for each product
    const productDetails = await Promise.all(
      products.map(async (product) => {
        const metafieldsResponse = await axios.get(
          `${SHOPIFY_STORE_URL}/products/${product.id}/metafields.json`,
          { headers }
        );
        return {
          ...product,
          metafields: metafieldsResponse.data.metafields,
        };
      })
    );

    // Log product details including metafields
    productDetails.forEach((product) => {
      console.log(
        `ID: ${product.id}, Title: ${product.title}, Price: ${
          product.variants[0].price
        }, Metafields: ${JSON.stringify(product.metafields, null, 2)}`
      );
    });

    return productDetails;
  } catch (error) {
    console.error("Error fetching products or metafields:", error);
    throw new Error("Error fetching products or metafields");
  }
};

exports.listProductsWithMissingMetafields = async () => {
  try {
    let allProducts = [];
    let hasMoreProducts = true;
    let nextPageInfo = null;

    while (hasMoreProducts) {
      const params = {
        limit: 250,
      };

      if (nextPageInfo) {
        params.page_info = nextPageInfo;
      }

      const response = await shopify.product.list(params);
      const products = response.products || response;

      allProducts = allProducts.concat(products);

      if (response.nextPageParameters) {
        nextPageInfo = response.nextPageParameters.page_info;
      } else {
        hasMoreProducts = false;
      }
    }

    const productsWithoutMetafields = [];

    await Promise.all(
      allProducts.map(async (product) => {
        try {
          //! Obtener metacampos para cada producto
          const metafields = await shopify.metafield.list({
            metafield: {
              owner_resource: "product",
              owner_id: product.id,
            },
          });

          if (metafields.length > 0) {
            console.log(`Producto con metafields encontrado: ${product.id}`);
            return;
          }
        } catch (error) {
          console.log(`Producto sin metacampos: ${product.id}`);
          productsWithoutMetafields.push({
            product: {
              id: product.id,
              title: product.title,
            },
          });
        }
      })
    );

    return {
      success: true,
      data: productsWithoutMetafields,
    };
  } catch (error) {
    console.error(
      `Error Listando Productos. productController.js: ${error.message}`
    );
    throw {
      success: false,
      message: `Error Listando Productos. productController.js: ${error.message}`,
    };
  }
};

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

    const data = [["Title", "ID"]];

    allCollections.forEach((collection) => {
      data.push([collection.title, collection.id]);
    });

    //const worksheet = XLSX.utils.aoa_to_sheet(data);
    //XLSX.utils.book_append_sheet(workbook, worksheet, 'Collections');
    //XLSX.writeFile(workbook, 'collections.xlsx');

    return allCollections;
  } catch (error) {
    console.error("Error fetching collections:", error.message);
    throw new Error("Error fetching collections");
  }
};

exports.listProductIDsByName = async (productName) => {
  try {
    const response = await shopify.product.list();
    const products = response;

    const sanitizedProductName = productName
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/ /g, "[\\s_-]");
    const productRegex = new RegExp(sanitizedProductName, "i");

    // Evaluar Coincidencias
    const matchedProducts = products.filter((product) =>
      productRegex.test(product.title)
    );

    if (matchedProducts.length > 0) {
      return matchedProducts.map((product) => ({
        id: product.id,
        title: product.title,
        // Demas datos que se quieran mostrar
      }));
    } else {
      return `No se encontraron productos que coincidan con el nombre: ${productName}`;
    }
  } catch (error) {
    console.error(error.message);
    throw new Error("Error al obtener los IDs de los productos.");
  }
};

//todo: CREAR CHILD PRODUCT CON SUS PRECIOS Y STOCK ASOCIADO
exports.createProduct = async (productData) => {
  try {
    const productExists = await checkIfProductIsCreatedUsingSKU(
      productData.product.variants[0].sku
    );

    const isStructureValid = validateCreatedProductStructure(productData)

    if (!productExists && isStructureValid) {
      productData.product.images = [
        {
          src: `https://cdn.shopify.com/s/files/1/0586/0117/7174/files/${productData.product.variants[0].sku}.jpg`,
        },
      ];

      let childProductData = {
        "product": {
          "lumps": productData.product.lumps,
          "collection": productData.product.collection,
          "title": productData.product.title,
          "tags": "interior",
          "vendor": productData.product.vendor,
          "variants": [
            {
              "price": productData.product.variants[0].price,
              "sku": productData.product.variants[0].sku,
              "inventory_management": "shopify",
              "inventory_quantity": productData.product.variants[0].inventory_quantity
            }
          ]
        }
      }
  
      // Control de stock
      if(productData.product.variants[0].inventory_quantity > 4){
        productData.product.variants[0].inventory_quantity = Math.ceil(productData.product.variants[0].inventory_quantity * 0.7)
        childProductData.product.variants[0].inventory_quantity = Math.ceil(childProductData.product.variants[0].inventory_quantity * 0.3)
      } else {
        productData.product.variants[0].inventory_quantity = 0
        childProductData.product.variants[0].inventory_quantity = 0
      }
      
      // No existe oferta
      if (productData.product.lumps && !productData.product.variants[0].compare_at_price) {
        productData.product.variants[0].price = productData.product.variants[0].price * productData.product.lumps;
        childProductData.product.variants[0].price = Number((childProductData.product.variants[0].price * productData.product.lumps * 1.06).toFixed(2))
      }
  
      // Existe oferta
      if (productData.product.lumps && productData.product.variants[0].compare_at_price) {
        productData.product.variants[0].compare_at_price = productData.product.variants[0].compare_at_price * productData.product.lumps;
        productData.product.variants[0].price = productData.product.variants[0].price * productData.product.lumps;
  
        childProductData.product.variants[0].compare_at_price = Number((productData.product.variants[0].compare_at_price * 1.06).toFixed(2));
        childProductData.product.variants[0].price = productData.product.variants[0].price;
      }

      const amba = await axios.post(
        `${SHOPIFY_STORE_URL}/products.json`,
        productData,
        { headers }
      );

      const interior = await axios.post(
        `${SHOPIFY_STORE_URL}/products.json`,
        childProductData,
        { headers }
      );
      
      const productId = amba.data.product.id;
      const childId = interior.data.product.id

      await productController.postProductToDB(
        amba.data.product,
        productData.product.collection,
        childId
      );

      if (
        productData.product.collection &&
        productData.product.collection.length > 0
      ) {
        await assignNewProductToCollections(
          productId,
          productData.product.collection
        );
        await assignNewProductToCollections(
          childId,
          productData.product.collection
        );
      }

      if (productData.product.lumps) {
        await addBultMetafield(productId, productData.product.lumps);
        await addBultMetafield(childId, productData.product.lumps);
      }

      console.log(`Producto ${productId} Creado Exitosamente`);
      return amba.data;
    } else {
      console.log(`Producto ${productData.product.variants[0].sku} Ya Creado`);
    }
  } catch (error) {
    console.log("Error Creando Producto. shopifyClient. ", error.message);
    throw error;
  }
};

//todo: Validacion de producto existente
exports.updateProductStockAndPrice = async (id, lumps, newStock, price, compare_at_price) => {
  try {
    // Control de stock
    let ambaStock = 0
    let interiorStock = 0

    if(newStock > 4){
      ambaStock = Math.ceil(newStock * 0.7)
      interiorStock = Math.ceil(newStock * 0.3)
    } 

    // Obtener child product
    const mongoProduct = await Product.findOne({ id: id });
    const child_id = mongoProduct.child_id;

    // Obtener ambos productos
    const product = await shopify.product.get(id);
    const childProduct = await shopify.product.get(child_id);

    // Variants de ambos
    const inventoryItemId = product.variants[0].inventory_item_id;
    const childInventoryItemId = childProduct.variants[0].inventory_item_id;

    // locations
    const locations = await shopify.location.list();
    const locationId = locations[0].id;

    // Stock update
    const inventoryUpdateResponse = await shopify.inventoryLevel.set({
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available: ambaStock,
    });
    const childInventoryUpdateResponse = await shopify.inventoryLevel.set({
      location_id: locationId,
      inventory_item_id: childInventoryItemId,
      available: interiorStock,
    });

    // Price update
    const priceUpdate = await updateProductPrice(id, lumps, price, compare_at_price)

    return {
      ['AMBA']: {
        id: Number(id),
        stock: inventoryUpdateResponse.available, 
        precio: priceUpdate.priceUpdateResponse.price,
        precioComparacion: priceUpdate.priceUpdateResponse.compare_at_price,
        tieneDescuento: priceUpdate.priceUpdateResponse.tieneDescuento
      },
      ['INTERIOR']: {
        id: child_id,
        stock: childInventoryUpdateResponse.available, 
        precio: priceUpdate.childPriceUpdateResponse.price,
        precioComparacion: priceUpdate.childPriceUpdateResponse.compare_at_price,
        tieneDescuento: priceUpdate.childPriceUpdateResponse.tieneDescuento
      }
    }
  } catch (error) {
    console.error("Error actualizando stock en Shopify", error.message);
    throw error;
  }
};

//todo: Collection oferta
const updateProductPrice = async (id, lumps, price, compare_at_price) => {
  price = price * lumps;
  if (compare_at_price) {
    compare_at_price = compare_at_price * lumps;
  }

  try {
    let amba = { price, compare_at_price };
    let interior = { price, compare_at_price };
    let isProductInOffer = false

    // Obtener el producto principal y el producto hijo desde Shopify
    const product = await shopify.product.get(id);
    const mongoProduct = await Product.findOne({ id: id });
    const child_id = mongoProduct.child_id;
    const childProduct = await shopify.product.get(child_id);

    const variantId = product.variants[0].id;
    const childVariantId = childProduct.variants[0].id;

    //! Coleccion de oferta
    const isCollectionInProduct = await checkIfCollectionIsOnProduct(id, 282433814614);
    if (!isCollectionInProduct && compare_at_price) {
      await assignProductToCollections(id, [282433814614]);
      await assignProductToCollections(child_id, [282433814614]);
      await Product.updateOne(
        { id: id },
        {
          $push: {
            collections: {
              id: 282433814614,
            },
          },
        }
      );
    }

    if (isCollectionInProduct && !compare_at_price) {
      await removeProductFromCollections(id, [282433814614]);
      await removeProductFromCollections(child_id, [282433814614]);
      await Product.updateOne(
        { id: id },
        {
          $pull: {
            collections: {
              id: 282433814614,
            },
          },
        }
      );
    }

    // Manejo de Precios
    if (!compare_at_price) {
      interior.price = Number((price * 1.06).toFixed(2));
      interior.compare_at_price = null; 
    } else {
      isProductInOffer = true

      amba.compare_at_price = compare_at_price;
      amba.price = price;

      interior.compare_at_price = Number((compare_at_price * 1.06).toFixed(2));
      interior.price = price;
    }

    // Actualizar precios de las variantes en el producto principal
    const variant = product.variants.find(v => v.id === variantId);
    variant.price = amba.price;
    variant.compare_at_price = amba.compare_at_price || null; 

    // Actualizar precios de las variantes en el producto hijo
    const childVariant = childProduct.variants.find(v => v.id === childVariantId);
    childVariant.price = interior.price;
    childVariant.compare_at_price = interior.compare_at_price || null; 

    const priceUpdateResponse = await shopify.product.update(product.id, {
      variants: product.variants,
    });
    const childPriceUpdateResponse = await shopify.product.update(childProduct.id, {
      variants: childProduct.variants,
    });

    return {
      priceUpdateResponse: {
        price: priceUpdateResponse.variants[0].price,
        compare_at_price: priceUpdateResponse.variants[0].compare_at_price ? priceUpdateResponse.variants[0].compare_at_price : 'No definido',
        tieneDescuento: isProductInOffer
      }, 
      childPriceUpdateResponse: {
        price: childPriceUpdateResponse.variants[0].price,
        compare_at_price: childPriceUpdateResponse.variants[0].compare_at_price ? childPriceUpdateResponse.variants[0].compare_at_price : 'No definido',
        tieneDescuento: isProductInOffer
      }
    };
  } catch (error) {
    console.error("Error actualizando el precio en Shopify", error);
    throw error;
  }
};


exports.updateProduct = async (id, productData) => {
  try {
    let childProductData = {
      "product": {
				"lumps": productData.product.lumps,
				"id": productData.product.id,
				"tags": "interior",
				"vendor": productData.product.vendor,
				"variants": [
					{
						"price": productData.product.variants[0].price,
						"sku": productData.product.variants[0].sku,
						"inventory_management": "shopify",
						"inventory_quantity": productData.product.variants[0].inventory_quantity 
					}
				]
			}
    }

    // Control de stock
    if(productData.product.variants[0].inventory_quantity > 4){
      productData.product.variants[0].inventory_quantity = Math.ceil(productData.product.variants[0].inventory_quantity * 0.7)
      childProductData.product.variants[0].inventory_quantity = Math.ceil(childProductData.product.variants[0].inventory_quantity * 0.3)
    } else {
      productData.product.variants[0].inventory_quantity = 0
      childProductData.product.variants[0].inventory_quantity = 0
    }
    
    // No existe oferta
    if (productData.product.lumps && !productData.product.variants[0].compare_at_price) {
      productData.product.variants[0].price = productData.product.variants[0].price * productData.product.lumps;
      childProductData.product.variants[0].price = Number((childProductData.product.variants[0].price * productData.product.lumps * 1.06).toFixed(2))
    }

    // Existe oferta
    if (productData.product.lumps && productData.product.variants[0].compare_at_price) {
      productData.product.variants[0].compare_at_price = productData.product.variants[0].compare_at_price * productData.product.lumps;
      productData.product.variants[0].price = productData.product.variants[0].price * productData.product.lumps;

      childProductData.product.variants[0].compare_at_price = Number((productData.product.variants[0].compare_at_price * 1.06).toFixed(2));
      childProductData.product.variants[0].price = productData.product.variants[0].price;
    }

    const productExists = await checkIfProductIsCreated(productData.product.id);
    const isStructureValid = validateUpdateProductStructure(productData)

    if (!productExists && isStructureValid) {
      const mongoProduct = await Product.findOne({ id: id });
      const child_id = mongoProduct.child_id;
      childProductData.product.id = child_id

      const response = await axios.put(
        `${SHOPIFY_STORE_URL}/products/${id}.json`,
        productData,
        { headers }
      );
      
      const childReponse = await axios.put(
        `${SHOPIFY_STORE_URL}/products/${child_id}.json`,
        childProductData,
        { headers }
      );
      
      console.log(`Parent: ${response.status}`)
      console.log(`Child: ${childReponse.status}`)

      // Coleccion de Oferta
      const productId = response.data.product.id;
      const isCollectionInProduct = await checkIfCollectionIsOnProduct(
        productId,
        282433814614
      );

      if (
        !isCollectionInProduct &&
        productData.product.variants[0].compare_at_price
      ) {
        await assignProductToCollections(productId, [282433814614]);
        await assignProductToCollections(child_id, [282433814614]);
        await Product.updateOne(
          { id: productId },
          {
            $push: {
              collections: {
                id: 282433814614,
              },
            },
          }
        );
      }

      if (
        isCollectionInProduct &&
        !productData.product.variants[0].compare_at_price
      ) {
        await removeProductFromCollections(productId, [282433814614]);
        await removeProductFromCollections(child_id, [282433814614]);
        await Product.updateOne(
          { id: productId },
          {
            $pull: {
              collections: {
                id: 282433814614,
              },
            },
          }
        );
      }

      if (
        productData.product.newCollection &&
        productData.product.newCollection.length > 0
      ) {
        await assignProductToCollections(
          productId,
          productData.product.newCollection
        );
        await assignProductToCollections(
          child_id,
          productData.product.newCollection
        );
      }

      if (
        productData.product.deleteCollection &&
        productData.product.deleteCollection.length > 0
      ) {
         await removeProductFromCollections(
          productId,
          productData.product.deleteCollection
        );git
        await removeProductFromCollections(
          child_id,
          productData.product.deleteCollection
        );
      }

      return response.data;
    } else {
      console.log(`Producto ${productData.product.id} no existe o no cumple con la estructura necesaria.`);
    }
  } catch (error) {
    console.log(`Error ${productData.product.id} Actualizando Producto. Shopifyclient`, error);
    postErrorLogsToAPI(error, 'update', productData)
    throw error;
  }
};

exports.updateProductStockV2 = async (id, newStock) => {
  try {
    const product = await shopify.product.get(id);
    const inventoryItemId = product.variants[0].inventory_item_id;

    const locations = await shopify.location.list();
    const locationId = locations[0].id;

    const inventoryUpdateResponse = await shopify.inventoryLevel.set({
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available: newStock,
    });

    return inventoryUpdateResponse;
  } catch (error) {
    console.error("Error actualizando stock en Shopify", error.message);
    throw error;
  }
};

//TODO
exports.deleteProduct = async (id) => {
  try {
    const productExists = await checkIfProductIsCreated(id);

    //! const product = productController.getProduct(id)
    //! product.child_id
    //! shopify.product.delete(child_id);

    if (!productExists) {
      console.log(`Producto ${id} no existe en la base de datos.`);
      return null;
    }

    const response = await shopify.product.delete(id);
    console.log(`Producto ${id} eliminado correctamente en Shopify.`);

    return response;
  } catch (error) {
    console.error(`Error eliminando el producto ${id}:`, error.message);
    throw error;
  }
};

const checkIfProductIsCreated = async (productId) => {
  try {
    const product = await Product.findOne({ id: productId });
    return !!product;
  } catch (error) {
    console.error(`Error buscando el producto con ID ${productId}:`, error);
    throw error;
  }
};

const checkIfProductIsCreatedUsingSKU = async (sku) => {
  try {
    const product = await Product.findOne({ sku: `${sku}` });
    return !!product;
  } catch (error) {
    console.error(`Error buscando el producto con SKU ${sku}:`, error);
    throw error;
  }
};

//! GET de Productos junto a sus colecciones
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.getProductsWithCollections = async () => {
  try {
    //! CARGAR: 7413762359382, 7413726937174:
    let allProducts = [];
    let hasMoreProducts = true;
    let nextPageInfo = null;

    while (hasMoreProducts) {
      const params = {
        limit: 250,
      };

      if (nextPageInfo) {
        params.page_info = nextPageInfo;
      }

      const response = await shopify.product.list(params);
      const products = response.products || response;

      allProducts = allProducts.concat(products);

      if (response.nextPageParameters) {
        nextPageInfo = response.nextPageParameters.page_info;
      } else {
        hasMoreProducts = false;
      }
    }

    const productsWithCollections = [];
    for (const product of allProducts) {
      try {
        const collections = await shopify.customCollection.list({
          product_id: product.id,
        });

        const filteredCollections = collections.map((collection) => ({
          id: collection.id,
          title: collection.title,
        }));

        if (filteredCollections.length <= 2) {
          productsWithCollections.push({
            id: product.id,
            title: product.title,
            collections: filteredCollections,
            variants: [
              {
                sku: product.variants[0].sku,
                price: product.variants[0].price,
                compare_at_price: product.variants[0].compare_at_price,
                inventory_management: product.variants[0].inventory_management,
                inventory_quantity: product.variants[0].inventory_quantity,
              },
            ],
          });

          console.log(
            `Producto ID ${product.id} con ${filteredCollections.length} colecciones procesado`
          );
        }
      } catch (error) {
        console.error(
          `Error al obtener colecciones para el producto ${product.id}:`,
          error
        );
      }
    }

    return productsWithCollections;
  } catch (error) {
    console.error("Error al obtener productos y colecciones:", error);
    throw error;
  }
};

//! Asignar Colecciones
const assignProductToCollections = async (productId, newCollectionIds) => {
  try {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const collectionId of newCollectionIds) {
      console.log(
        `Asignando producto ${productId} a colección ${collectionId}`
      );
      try {
        const isCollectionInProduct = await checkIfCollectionIsOnProduct(
          productId,
          collectionId
        );

        if (!isCollectionInProduct) {
          await shopify.collect.create({
            product_id: productId,
            collection_id: collectionId,
          });          

          console.log(`Asignado exitosamente a colección ${collectionId}`);
          
          await delay(100);
        } else {
          console.log(`Producto ya existente en coleccion ${collectionId}`);
        }
      } catch (err) {
        console.log(
          `Error al asignar a colección ${collectionId}:`,
          err.response ? err.response.data : err.message
        );
        throw err;
      }
    }
  } catch (error) {
    console.log("Error asignando producto a colecciones:", error.message);
    throw error;
  }
};

const assignNewProductToCollections = async (productId, newCollectionIds) => {
  try {
    for (const collectionId of newCollectionIds) {
      console.log(
        `Asignando producto ${productId} a colección ${collectionId}`
      );
      try {
        await shopify.collect.create({
          product_id: productId,
          collection_id: collectionId,
        });
        
        console.log(`Asignado exitosamente a colección ${collectionId}`);
      } catch (err) {
        console.log(
          `Error al asignar a colección ${collectionId}:`,
          err.response ? err.response.data : err.message
        );
        throw err;
      }
    }
  } catch (error) {
    console.log("Error asignando producto a colecciones:", error.message);
    throw error;
  }
};

//! Checkiar si una coleccion ya esta en un producto
const checkIfCollectionIsOnProduct = async (productId, collectionId) => {
  try {
    let product = await Product.findOne({ id: productId });

    if (!product) {
      product = await Product.findOne({ child_id: productId });
    }

    if (!product) {
      return false;
    }


    const collectionExists = product.collections.some(
      (collection) => collection.id == collectionId
    );

    return collectionExists;
  } catch (error) {
    console.error(
      `Error buscando el producto con ID ${productId} y la colección con ID ${collectionId}:`,
      error
    );
    throw error;
  }
};

//! Eliminar Colecciones
const removeProductFromCollections = async (
  productId,
  collectionIdsToRemove
) => {
  try {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const collectionId of collectionIdsToRemove) {
      //todo: Pasarlo a una DB externa
      const collects = await shopify.collect.list({
        product_id: productId,
        collection_id: collectionId,
      });

      if (collects.length > 0) {
        await shopify.collect.delete(collects[0].id);
        console.log(`Eliminado de la colección ${collectionId}`);
      } else {
        console.log(
          `No se encontró relación para eliminar entre el producto ${productId} y la colección ${collectionId}`
        );
      }

      await delay(250);
    }
  } catch (error) {
    console.log("Error Eliminando Producto de Colecciones: ", error.message);
    throw error;
  }
};

//! Crea un nuevo metafield y asigna el valor asociado para cada producto "bultos.custom". NO matchea con el metafield ya existente
const addBultMetafield = async (productId, unitsPerBult) => {
  try {
    const metafieldData = {
      namespace: "bultos",
      key: "custom",
      value: unitsPerBult,
      type: "number_decimal",
    };

    const response = await axios.post(
      `${SHOPIFY_STORE_URL}/products/${productId}/metafields.json`,
      { metafield: metafieldData },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log("Error Agregando Metafield. Shopifyclient ", error.message);
    throw error;
  }
};

//* -- -- Customers -- -- */
exports.listUsers = async () => {
  try {
    const customers = await shopify.customer.list();
    const customersWithMetafields = await Promise.all(
      customers.map(async (customer) => {
        const metafields = await shopify.metafield.list({
          metafield: { owner_resource: "customer", owner_id: customer.id },
        });
        return {
          ...customer,
          metafields,
        };
      })
    );
    return customersWithMetafields;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getUserByID = async (userId) => {
  const response = await axios.get(
    `${SHOPIFY_STORE_URL}/customers/${userId}.json`,
    { headers }
  );
  return response.data;
};

exports.getUserIDByName = async (customerName) => {
  try {
    const response = await shopify.customer.list();
    const customer = response;

    const sanitizedCustomertName = customerName
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/ /g, "[\\s_-]");
    const productRegex = new RegExp(sanitizedCustomertName, "i");

    // Evaluar Coincidencias
    const matchedCustomers = customer.filter((customer) =>
      productRegex.test(customer.first_name)
    );

    if (matchedCustomers.length > 0) {
      return matchedCustomers.map((customer) => ({
        id: customer.id,
        title: customer.first_name,
        // Demas datos que se quieran mostrar
      }));
    } else {
      return `No se encontraron clientes que coincidan con el nombre: ${customerName}`;
    }
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error al obtener los ID de ${customerName}`);
  }
};

exports.updateUser = async (userId, userData) => {
  try {
    const existingUser = await shopify.customer.get(userId);

    const updatedUserData = {
      ...existingUser,
      ...userData,
    };

    const response = await shopify.customer.update(userId, updatedUserData);

    return response;
  } catch (error) {
    console.error("Error actualizando el usuario:", error.message);
    throw new Error("Error actualizando el usuario");
  }
};

exports.deleteUser = async (userId) => {
  const response = await axios.delete(
    `${SHOPIFY_STORE_URL}/customers/${userId}.json`,
    { headers }
  );
  return response.data;
};

//* Aux Funcs
function validateUpdateProductStructure(json) {
  if (
    json.hasOwnProperty('product') &&
    json.product.hasOwnProperty('lumps') &&
    json.product.hasOwnProperty('id') &&
    json.product.hasOwnProperty('tags') &&
    json.product.hasOwnProperty('vendor') &&
    json.product.hasOwnProperty('variants') &&
    Array.isArray(json.product.variants) &&
    json.product.variants.every(variant => 
        variant.hasOwnProperty('price') &&
        variant.hasOwnProperty('sku') &&
        variant.hasOwnProperty('inventory_management') &&
        variant.hasOwnProperty('inventory_quantity')
    )) {
      return true;
    }
  return false;
}

function validateCreatedProductStructure(json) {
  if (
    json.hasOwnProperty('product') &&
    json.product.hasOwnProperty('lumps') &&
    json.product.hasOwnProperty('collection') &&
    json.product.hasOwnProperty('tags') &&
    json.product.hasOwnProperty('vendor') &&
    json.product.hasOwnProperty('variants') &&
    Array.isArray(json.product.variants) &&
    json.product.variants.every(variant => 
        variant.hasOwnProperty('price') &&
        variant.hasOwnProperty('sku') &&
        variant.hasOwnProperty('inventory_management') &&
        variant.hasOwnProperty('inventory_quantity')
    )) {
      return true;
    }
  return false;
}

const postErrorLogsToAPI = async (error, type, productData) => {
  const errorPayload = {
    type,
    productId: productData.product.id,
    message: error.message,
    additionalInfo: {
      ...productData.product,
    },
  };

  try {
    const log = new LogErrorProduct(errorPayload);
    await log.save();
    console.log('Log de error guardado correctamente en MongoDB');
  } catch (err) {
    console.error('Error guardando en MongoDB:', err);
  }
};


//! DEPRECATED
exports.updateProductStock = async (id, newStock) => {
  try {
    const product = await axios.get(
      `${SHOPIFY_STORE_URL}/products/${id}.json`,
      { headers }
    );
    const inventoryItemId = product.data.product.variants[0].inventory_item_id;

    const locationsResponse = await axios.get(
      `${SHOPIFY_STORE_URL}/locations.json`,
      { headers }
    );
    const locationId = locationsResponse.data.locations[0].id;

    const inventoryUpdateResponse = await axios.post(
      `${SHOPIFY_STORE_URL}/inventory_levels/set.json`,
      {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: newStock,
      },
      { headers }
    );

    console.log("Stock Actualizado Correctamente", inventoryUpdateResponse.data)
    return inventoryUpdateResponse.data;
  } catch (error) {
    console.error("Error actualizando stock. shopifyClient ", error.message);
    throw error;
  }
};

//! DEPRECATED
const checkIfProductIsCreatedUsingAPI = async (sku) => {
  try {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const products = await shopifyClient.product.list();

    for (const product of products) {
      const variant = product.variants.find((variant) => variant.sku === sku);
      if (variant) {
        console.log(
          `Producto con SKU ${sku} ya existe. ID de producto: ${product.id}`
        );
        return true;
      }
      await delay(250);
    }
    console.log(`Producto con SKU ${sku} no existe.`);
    return false;
  } catch (error) {
    console.log("Error al verificar si el producto existe: ", error.message);
    throw error;
  }
};

//! DEPRECATED
const checkIfCollectionIsOnProductUsingAPI = async (
  productId,
  collectionId
) => {
  try {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const customCollections = await shopify.customCollection.list({
      product_id: productId,
    });
    const isInCollection = customCollections.some(
      (collection) => collection.id.toString() === collectionId.toString()
    );

    await delay(200);

    return isInCollection;
  } catch (error) {
    console.error("Error al consultar el producto:", error.message);
    return false;
  }
};