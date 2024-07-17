Data:
- Formato de comunicacion de archivos: JSON
- Tipo de API: REST
- En la solicitud JSON, No es necesario que esten los 3 tipos de accion a la vez. Pueden, pero no es necesario
- Para editar y eliminar productos, la clave para identificarlos sera el Nombre ("id"). Esto porque la clave primaria con la que trabaja Sh es con ID. No permite otro dato para sincronizar datos. Se referencia por ID
- Cuando se edita un producto, no es necesario enviar el producto completo. solo las props a modificar 
- Tests: Trendy
- Producccion: Alpha X

Hecho: 
- Leer (todos) [products/list] [GET]
- Carga (masiva) ¯¯¯¯¯¯¯¯¯¯| 
- Edicion (masiva) --------->  Ya es posible hacerlo en una misma peticion. [ERP_CUD_PETITION_EXAMPLE.json] [products/batch] [POST] (Los titulos no pueden coincidir)
- Eliminacion (masiva) ____|
TODO

Headers: 
- Accept-Encoding: gzip, defilate, br
- Cache-Control: no-cache
- Content-Type: application/json
- Connection: keep-alive
- x-auth-key: process.env.AUTH_KEY
