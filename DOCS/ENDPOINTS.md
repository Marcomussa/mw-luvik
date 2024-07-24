*Documentacion de Endpoints*
**Autenticacion**
Cada peticion a realizar debera ser realizada enviando una clave en los headers de cada una de estas. 
Headers: 
- optional Accept-Encoding: gzip, defilate, br
- optional Cache-Control: no-cache
- optional Connection: keep-alive
- required Content-Type: application/json
- required x-auth-key: ${AUTH_KEY}

**Productos**
***POST /products/batch***
Descripción: Maneja el lote de operaciones Create, Update, Delete de un conjunto de productos. 
Tipo de Petición: POST
Datos a Enviar:
{
  "created": [{
    // Estructura de datos del lote
  }],
  "updated": [{
    // Estructura de datos del lote
  }],
  "deleted": [{
    // Estructura de datos del lote
  }]
}
Controlador: productController.handleBatch()
Estructura de Datos: 
- Created: Conjunto de Productos a ser creado en Shopify. 
productData required --> productData Producto
No pasar ID. Este es creado automaticamente en Shopify
No repetir titulos. Devuelve estado 422

- Updated: Conjunto de Productos a ser editados. 
id required
productData optional --> Se pasan las propiedades junto a sus valores asociados a ser editados

- Deleted: Conjunto de Productos a ser eliminados. 
id required

Importante: Esta peticion maneja las 3 operaciones de manera simultanea. No es necesario realizarlas de manera simultanea. Se pueden realizar de manera independiente unicamente especificando la operacion junto a sus datos. 

El scope de Product de la API de Shopify no incluye la propiedad "collections". Igualmente es posible asignarle la coleccion pasando la propiedad "collection" junto al ID de la coleccion. 

Ejemplo + detallado:
{
  "created": [
    {
      "product": {
        "collection": "collection_id"
        "title": "Title",
        // ... product keys
        "variants": [{
          "compare_at_price": "150",
          "price": "100",
          "sku": "ABC123"
          // ... product variant keys
        }]
      }
    },
    //  ...product
  ],
    "updated": [
      {
        "product": {
          "id": "1"
          "title": "New Title",
          // ...product keys
        }
        // ...product
      }
    ],
    "deleted": [
      "1",
      "2"
      // ...product id's
    ]
}
  
***POST /update-stock/:id/:newStock*** --> ERP a Shopify
Descripción: Actualiza el stock de un producto específico.
Parámetros en la URL:
id (number): El ID del producto cuyo stock se va a actualizar.
newStock (number): La nueva cantidad de stock.
Datos a Enviar: No se requiere un cuerpo en la solicitud, ya que los datos necesarios están en los parámetros de la URL.
Controlador: productController.updateProductStock

***POST /update-stock-webhook/:id/:newStock*** --> Shopify a ERP
PENDIENTE

***GET /list***
Descripción: Obtiene y lista todos los productos de la tienda.
Datos a Enviar: No se requiere un cuerpo en la solicitud.
Controlador: productController.listProducts

***GET /list-collections***
Descripción: Obtiene y lista ID y Nombre todas las colecciones de la tienda. 
Datos a Enviar: No se requiere un cuerpo en la solicitud.
Controlador: productController.listCollections

***GET /get-id-by-name/:name***
Descripción: Busca productos por nombre y devuelve los IDs de los productos coincidentes.
Parámetros en la URL: 
name (string): El nombre del producto a buscar.
Datos a Enviar: No se requiere un cuerpo en la solicitud, ya que el nombre del producto está en el parámetro de la URL.
Controlador: productController.getProductIDsByName

**Usuarios**
***GET /list***
Descripción: Obtiene y lista todos los usuarios de la tienda.
Datos a Enviar: No se requiere un cuerpo en la solicitud.
Controlador: customerController.listUsers

***GET /get-id-by-name/:name***
Descripción: Busca usuarios por nombre y devuelve los IDs de los usuarios coincidentes.
Tipo de Petición: GET
Parámetros en la URL:
name (string): El nombre del usuario a buscar.
Datos a Enviar: No se requiere un cuerpo en la solicitud, ya que el nombre del usuario está en el parámetro de la URL.
Controlador: customerController.getUserIDByName

***GET /list/:id***
Descripción: Obtiene los detalles de un usuario específico por ID.
Tipo de Petición: GET
Parámetros en la URL:
id (number): El ID del usuario cuyos detalles se van a obtener.
Datos a Enviar: No se requiere un cuerpo en la solicitud, ya que el ID del usuario está en el parámetro de la URL.
Controlador: customerController.getUserByID

***POST /delete/:id***
Descripción: Elimina un usuario específico por ID.
Tipo de Petición: POST
Parámetros en la URL:
id (number): El ID del usuario que se va a eliminar.
Datos a Enviar: No se requiere un cuerpo en la solicitud, ya que el ID del usuario está en el parámetro de la URL.
Controlador: customerController.deleteUser

***POST /update/:id***
Descripción: Actualiza los detalles de un usuario específico por ID.
Tipo de Petición: POST
Parámetros en la URL:
id (number): El ID del usuario cuyos detalles se van a actualizar.
Datos a Enviar:
{
  "userData": {
    // Estructura de los datos del usuario a actualizar
  }
}
Controlador: customerController.updateUser


