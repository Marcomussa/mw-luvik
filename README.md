Data:
- Formato de comunicacion de archivos: JSON
- Tipo de API: REST
- En la solicitud JSON, No es necesario que esten los 3 tipos de accion a la vez. Pueden pero no es necesario
- Para editar y eliminar productos, la clave para identificarlos sera el Nombre ("id")
- Cuando se edita un producto, no es necesario enviar el producto completo. solo las props a modificar 
- updateProductStock, es necesario definir cómo actualizar el inventario de un producto específico en Shopify. Dado que Shopify no permite actualizar el inventario directamente en el objeto del producto, se debe actualizar el inventario a través del recurso de InventoryLevel. 
- Tests: Trendy
- Producccion: Alpha X

To-Do:
- Configurar Webhooks
- Configurar Server para subir este codigo
- Documentar
- Implementacion de capas de seguridad  