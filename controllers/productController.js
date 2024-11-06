const productService = require("../services/productService");
const shopifyClient = require("../clients/shopifyClient");
const Product = require("../models/Product");
const Collection = require("../models/Collection");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const localDataPath = path.join(__dirname, "../JSON_examples/productList.json");


exports.postCollectionsToDB = async () => {
  try {
    const response = await shopifyClient.listCollections();
    const collections = response;

    await Collection.deleteMany({});
    await Collection.insertMany(collections, { ordered: false });
  } catch (error) {
    console.error("Error guardando producto en la base de datos:", error);
  }
};

exports.postProductToDB = async (product, collection, child_id) => {
  try {
    const productID = product.id;
    const productTitle = product.title;
    const productSKU = product.variants[0].sku
    const collections = collection.map((id) => ({
      id: id,
    }));

    const newProduct = new Product({
      id: productID,
      title: productTitle,
      collections: collections,
      sku: productSKU,
      child_id
    });

    await newProduct.save();

    console.log(`Producto ${productTitle} insertado correctamente en DB.`);
  } catch (error) {
    console.error("Error guardando colecciones en la base de datos:", error);
  }
};

//! DEPRECATED
exports.addSubIDProductToDB = async (id, childId) => {
  try {
    const product = await Product.findOne({ id: id });

    if (!product) {
      console.log(`Producto ${id} no encontrado`);
      return;
    }

    product.child_id = childId; 

    await product.save();

    console.log('Producto actualizado:', id);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
  }
}

exports.updateProductToDB = async (product) => {
  try {
    const productId = product.product.id;
    const newCollection = product.product.newCollection;
    const deleteCollection = product.product.deleteCollection;

    const existingProduct = await Product.findOne({ id: productId });

    if (!existingProduct) {
      console.error(`Producto con ID ${productId} no encontrado.`);
      return;
    }

    if (newCollection && newCollection.length > 0) {
      await Product.updateOne(
        { id: productId },
        {
          $addToSet: {
            collections: {
              $each: newCollection.map((id) => ({ id })),
            },
          },
        }
      );
    }

    if (deleteCollection && deleteCollection.length > 0) {
      await Product.updateOne(
        { id: productId },
        {
          $pull: {
            collections: {
              id: {
                $in: deleteCollection,
              },
            },
          },
        }
      );
    }

    console.log(`Producto ${productId} Actualizado Correctamente en DB.`);
  } catch (error) {
    console.error("Error guardando colecciones en la base de datos:", error);
  }
};

exports.deleteProductFromDB = async (productId) => {
  try {
    const result = await Product.deleteOne({ id: productId });

    if (result.deletedCount === 0) {
      console.log(`No se encontró un producto con ID ${productId}.`);
    } else {
      console.log(`Producto con ID ${productId} eliminado correctamente.`);
    }
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${productId}:`, error);
  }
};

async function updateSKUToDb() {
  const fileContent = fs.readFileSync(localDataPath, "utf-8");
  const localData = JSON.parse(fileContent);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conexión exitosa a MongoDB');

  for (const item of localData) {
    const { id, variants } = item;
    const newSku = variants[0]?.sku;
    const product = await Product.findOne({ id });

    if (product) {
      product.sku = newSku; 
      await product.save();
      console.log(`Producto con ID ${id} actualizado con SKU: ${newSku}`);
    } else {
      console.log(`No se encontró producto con ID: ${id}`);
    }
  }
}

exports.handleBatch = async (req, res) => {
  try {
    const { created, updated, deleted } = req.body;
    const createdProductIds = await productService.handleBatch(
      created,
      updated,
      deleted
    );

    // Determina si se han creado nuevos productos para incluir en la respuesta
    const response = {
      message: "Batch Ok",
    };

    if (created && created.length > 0) {
      response.createdProductIds = createdProductIds;
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error });
    console.log("Error en Batch (Productos). productController.js");
    console.log(error.message);
  }
};

exports.listProducts = async (req, res) => {
  try {
    const response = await shopifyClient.listProducts();
    console.log(response.data.length);
    res.status(200).json(response);
  } catch (error) {
    console.log(
      "Error Listando Productos. productController.js",
      error.message
    );
  }
};

exports.listProductsWithMissingMetafields = async (req, res) => {
  try {
    const response = await shopifyClient.listProductsWithMissingMetafields();
    res.status(200).json(response);
  } catch (error) {
    console.log(
      "Error Listando Productos. productController.js",
      error.message
    );
  }
};

exports.getProductsWithCollections = async (req, res) => {
  try {
    const response = await shopifyClient.getProductsWithCollections();
    //! POST Product a DB
    // for (let i = 0; i < response.length; i++) {
    //   const productId = response[i].id
    //   const productTitle = response[i].title
    //   const collections = response[i].collections.map(collection => ({
    //     id: collection.id,
    //     title: collection.title
    //   }));

    //   const newProduct = new Product({
    //     id: productId,
    //     title: productTitle,
    //     collections: collections
    //   });

    //   await newProduct.save();
    // }

    console.log(response);
    console.log("Cantidad Productos Shopify", response.length);
    res.status(200).json(response);
  } catch (error) {
    console.log(
      "Error Listando Productos con Colecciones. productController.js",
      error.message
    );
  }
};

async function countProducts() {
  try {
    const productCountInDb = await Product.countDocuments();
    const productCountInShopify = await shopifyClient.getTotalProducts();

    console.log("DB:", productCountInDb);
    console.log("Shopify:", productCountInShopify);

    return { DB: productCountInDb, SHOPIFY: productCountInShopify };
  } catch (error) {
    console.error("Error counting products:", error);
  }
}

exports.countProducts = async (req, res) => {
  try {
    const productCount = await countProducts();
    return res.status(200).json(productCount);
  } catch (error) {
    console.error("Error counting products:", error);
  }
};

exports.listProductByID = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await shopifyClient.listProductByID(id);
    res.status(200).json(response);
  } catch (error) {
    console.log(
      "Error Listando Productos. productController.js",
      error.message
    );
  }
};

exports.listProductIDsByName = async (req, res) => {
  const { name } = req.params;
  try {
    const response = await shopifyClient.listProductIDsByName(name);
    res.status(200).json(response);
  } catch (error) {
    console.log(
      `Error Obteniendo ID de ${name}. productController.js`,
      error.message
    );
  }
};

exports.listCollections = async (req, res) => {
  try {
    const response = await shopifyClient.listCollections();
    res.status(200).json(response);
  } catch (error) {
    console.log(
      "Error Listando Productos. productController.js",
      error.message
    );
  }
};

exports.updateProductStockAndPrice = async (req, res) => {
  try {
    const { id, newStock, price, compare_at_price } = req.params;
    const newStockParsed = parseInt(newStock, 10); 
    const priceParsed = parseInt(price, 10); 
    const compareAtPriceParsed = parseInt(compare_at_price, 10); 

    const response = await shopifyClient.updateProductStockAndPrice(id, newStockParsed, priceParsed, compareAtPriceParsed);
    res.status(200).json(response);
  } catch (error) {
    console.log(
      "Error Actualizando Stock. productController.js",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
}

//! "inventory_management" = "shopify"
exports.updateProductStock = async (req, res) => {
  try {
    const { id, newStock } = req.params;
    const newStockParsed = parseInt(newStock, 10); // Convertir newStock a número
    const response = await shopifyClient.updateProductStock(id, newStockParsed);
    res.status(200).json(response);
  } catch (error) {
    console.log(
      "Error Actualizando Stock. productController.js",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};
