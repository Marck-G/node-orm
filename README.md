# KCS ORM Genius

KCS ORM Genius es una poderosa biblioteca de mapeo objeto-relacional (ORM) en Node.js que facilita la interacción con bases de datos relacionales. Te permite crear, consultar y administrar datos de una manera sencilla y eficiente.
## Instalación

Para comenzar a usar KCS ORM Genius en tu proyecto, primero debes instalarlo utilizando npm:
```bash
npm install kcs-orm-genius
```

## Uso
### Configuración de un Adapter
Antes de utilizar KCS ORM Genius, necesitas configurar un adaptador para conectarte a tu base de datos. Actualmente, KCS ORM Genius es compatible con adaptadores para MySQL y PostgreSQL. Aquí tienes un ejemplo de cómo configurar un adaptador para MySQL:
```javascript
const { MySQLAdapter,  PostgreSQLAdapter } = require('kcs-orm-genius');

const dbConfig = {
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'tu_base_de_datos'
};

const db = new MySQLAdapter(dbConfig);
const db = new PostgreSQLAdapter(dbConfig);
```

Reemplaza los valores en `dbConfig` con la información de tu base de datos.
### Creación de un Modelo
KCS ORM Genius permite que definas modelos para interactuar con las tablas de tu base de datos. Cada modelo representa una tabla y sus registros. Para crear un modelo, extiende la clase `Model` de KCS ORM Genius y configura el esquema de la tabla:
```javascript
const { Model } = require('kcs-orm-genius');

class User extends Model {
  static tableSchema = {
    tableName: 'users',
    columns: {
      id: 'integer',
      username: 'string',
      email: 'string',
      age: 'integer',
    },
  };
}
```
En este ejemplo, hemos creado un modelo llamado `User` que representa la tabla `users` con las columnas 
`id`, `username`, `email` y `age`. Asegúrate de que el esquema coincida con la estructura de tu tabla en la base de datos.

### Métodos de Modelo

`create(data)`

El método `create` permite insertar un nuevo registro en la base de datos. Si no se proporcionan datos, se creará un registro con campos nulos.

```javascript
const newUser = new User({ username: 'john_doe', email: 'john@example.com', age: 30 });
newUser.create()
  .then(() => {
    console.log('Nuevo usuario creado.');
  })
  .catch((error) => {
    console.error('Error al crear el usuario:', error);
  });

```

`findAll()`

El método `findAll` te permite recuperar todos los registros de la tabla.
```js
User.findAll()
  .then((users) => {
    console.log('Usuarios encontrados:', users);
  })
  .catch((error) => {
    console.error('Error al buscar usuarios:', error);
  });
```

`findById(id)`

El método `findById` busca un registro por su ID.

```js
User.findById(1)
  .then((user) => {
    console.log('Usuario encontrado:', user);
  })
  .catch((error) => {
    console.error('Error al buscar el usuario:', error);
  });
```

### Eliminación de un Registro
Puedes borrar un registro utilizando el método `delete` en una instancia de un modelo.
```js
const user = new User({ id: 1, username: 'john_doe', email: 'john@example.com', age: 30 });

user.delete()
  .then(() => {
    console.log('Usuario eliminado con éxito.');
  })
  .catch((error) => {
    console.error('Error al eliminar el usuario:', error);
  });
```

