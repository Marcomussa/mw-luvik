*Documentación de Métodos*
**Productos**
- listProducts()
Obtiene y lista todos los productos de la tienda.
Parámetros: No recibe parámetros.
Retorno: Devuelve un arreglo de productos.

- ListCollections()
Obtiene y lista los ID`s y Nombres de las colecciones de la tienda.
Parámetros: No recibe parámetros.
Retorno: Devuelve un arreglo de productos.

- listProductsWithMetafields()
Obtiene todos los productos de la tienda junto con sus metafields.
Parámetros: No recibe parámetros.
Retorno: Devuelve un arreglo de productos, cada uno con sus respectivos metafields.

- getProductIDsByName(productName string)
Busca productos por nombre y devuelve los IDs de los productos coincidentes.
Parámetro: El nombre del producto a buscar.
Retorno: Devuelve un arreglo de productos coincidentes con sus IDs y nombres.

- createProduct(productData product)
Crea un nuevo producto en la tienda.
Parámetro: Los datos del producto a crear.
Retorno: Devuelve los datos del producto creado.

- updateProduct(id int, productData product)
Actualiza los datos de un producto existente.
Parámetros: El ID del producto a actualizar & Los datos del producto a actualizar.
Retorno: Devuelve los datos del producto.

- updateProductStock(id int, newStock int)
Actualiza el stock de un producto.
Parámetros: El ID del producto cuyo stock se va a actualizar & La nueva cantidad de stock.
Retorno: Devuelve los datos de la actualización de stock.

- deleteProduct(id int)
Elimina un producto de la tienda.
Parámetros: El ID del producto a eliminar.
Retorno: No retorna datos.

**Usuarios**
- listUsers()
Obtiene y lista todos los clientes de la tienda.
Parámetros: No recibe parámetros.
Retorno: Devuelve un arreglo de clientes.

- getUserByID(userId int)
Obtiene los datos de un cliente por su ID.
Parámetros: userId (number): El ID del cliente a obtener.
Retorno: Devuelve los datos del cliente.

- getUserIDByName(customerName string)
Busca clientes por nombre y devuelve los IDs de los clientes coincidentes.
Parámetros: El nombre del cliente a buscar.
Retorno: Devuelve un arreglo de clientes coincidentes con sus IDs y nombres.

- updateUser(userId int, userData user)
Actualiza los datos de un cliente existente.
Parámetros: El ID del cliente a actualizar & Los datos del cliente a actualizar.
Retorno: Devuelve los datos del cliente actualizado.

- deleteUser(id int)
Elimina un cliente de la tienda.
Parámetros: El ID del cliente a eliminar.
Retorno: Devuelve los datos del cliente eliminado.

Con esta documentación se detallan los parámetros y el propósito de cada método, sin entrar en la implementación específica.