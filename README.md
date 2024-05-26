Data:
- Formato de comunicacion de archivos: JSON
- Tipo de API: REST
- En la solicitud JSON, No es necesario que esten los 3 tipos de accion a la vez. Pueden, pero no es necesario
- Para editar y eliminar productos, la clave para identificarlos sera el Nombre ("id"). Esto porque la clave primaria con la que trabaja Sh es con ID. No permite otro dato para sincronizar datos. Se referencia por ID
- Cuando se edita un producto, no es necesario enviar el producto completo. solo las props a modificar 
- updateProductStock, es necesario definir cómo actualizar el inventario de un producto específico en Shopify. Dado que Shopify no permite actualizar el inventario directamente en el objeto del producto, se debe actualizar el inventario a través del recurso de InventoryLevel. 
- Tests: Trendy
- Producccion: Alpha X

Hecho: 
- Leer (todos) [products/list] [GET]
- Carga (masiva) ¯¯¯¯¯¯¯¯¯¯| 
- Edicion (masiva) --------->  Ya es posible hacerlo en una misma peticion. [ERP_CUD_PETITION_EXAMPLE.json] [products/batch] [POST] 
- Eliminacion (masiva) ____|
- Actualizar Stock [ERP_UPDATE_STOCK_PETITION_PETITION_EXAMPLE.json] [products/update-stock] [POST]
- Precios Consumidor Final y Empresa

En Proceso: 
- Leer por grupo de productos, por parametros seleccionados
- Etapa Users, implementacion y relacion con products

To-Do:
- Configurar Server para subir este codigo
- Defnir Template
- Pruebas mas grandes y precisas
- App Shopify para mostrar precio x cliente