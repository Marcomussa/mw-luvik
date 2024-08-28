Data:
- Formato de comunicacion de archivos: JSON
- Tipo de API: REST
- En la solicitud JSON, No es necesario que esten los 3 tipos de accion a la vez. Pueden, pero no es necesario
- Para editar y eliminar productos, la clave para identificarlos sera el Nombre ("id"). Esto porque la clave primaria con la que trabaja Sh es con ID. No permite otro dato para sincronizar datos. Se referencia por ID
- Cuando se edita un producto, no es necesario enviar el producto completo. solo las props a modificar 
- Tests: Trendy
- Producccion: Alpha X

Tod-Do:
- Create solo, literalmente, va a cargar. Una vez que hace la carga y esta termina, devuelve state 200. Hecho eso, realizara la carga de bultos y colecciones
- Se valida el JSON si existen productos en createExcelToJSON. Implementar SDK de Shopify  en este y realizar los metodos GETS. El JSON a create le debe llegar limpio
- ENDPOINTS de carga de Webhooks

Headers: 
- Accept-Encoding: gzip, defilate, br
- Cache-Control: no-cache
- Content-Type: application/json
- Connection: keep-alive
- x-auth-key: process.env.AUTH_KEY
