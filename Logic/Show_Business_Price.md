Mostrar los precios de business_price al iniciar sesión como empresa. APP PERSONALIZADA EN SHOPIFY

**Añadir un campo adicional al perfil del usuario para indicar si es un "Consumidor Final" o una "Empresa".**
**Modificar la lógica para verificar el tipo de usuario durante el inicio de sesión.**
**Mostrar el precio adecuado según el tipo de usuario.**

- Paso 1: Añadir el campo adicional al perfil del usuario
Cada usuario debe tener un campo que indique su tipo (userType), que puede ser "consumidor_final" o "empresa".

- Paso 2: Verificar el tipo de usuario durante el inicio de sesión
Modificar la logica de inicio de sesión para recuperar el userType del usuario y almacenarlo en la sesión o en un token.

- Paso 3: Mostrar el precio adecuado según el tipo de usuario
Modifica tu lógica de frontend para mostrar el precio correcto basado en el userType.