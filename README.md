<p align="center">
  <a href="https://github.com/javiertrombetta/p5-box-back" target="blank"><img src="./public/assets/img/box.png" width="400" alt="Box" /></a>
</p>

<br>

# Box

Box es un proyecto de logística de última milla, permitiendo realizar las entregas de cientos de paquetes y que una empresa pueda monitorear la operación de los repartidores, y administrar la gestión de las entregas.

<br>

### Descripción de Box API Back-end

Este proyecto corresponde a la funcionalidad RestAPI de Box, para servir todas las consultas realizadas por [Box Front-End](https://github.com/javiertrombetta/p5-box-front). Te invitamos a decargar ambos proyectos y usar la aplicación completa.

<br>

### Flujo de Trabajo usando Gitflow

Este proyecto sigue el modelo de Gitflow, lo que significa que tiene una estructura de ramas designada para diferentes propósitos:

- `main`: Rama protegida que refleja la versión en producción.
- `develop`: Rama protegida para desarrollo. Todas las características nuevas se fusionan aquí.
- `feature/`: Ramas para nuevas características. Nombradas como `feature/nombre_de_la_caracteristica`.
- `release/`: Ramas para preparar lanzamientos. Nombradas como `release/0.X.0`.
- `hotfix/`: Ramas para arreglos urgentes en producción. Nombradas como `hotfix/descripcion_del_problema`.

<br>

### Pasos a seguir con Gitflow

1. Cloná el repositorio.
2. Creá la rama `develop` desde `main` si no existe.
3. Para nuevas características, crea una rama `feature/` desde `develop`.
4. Una vez completada la característica, realiza un pull request a `develop`.
5. Para lanzamientos, creá una rama `release/` desde `develop`.
6. Una vez listo el lanzamiento, fusioná `release/` en `main` y `develop`.
7. Etiquetá `main` con la versión del lanzamiento.
8. Para arreglos urgentes, crea una rama `hotfix/` desde `main`.
9. Una vez solucionado el problema, fusioná `hotfix/` en `main` y `develop`.

<br>

### Buenas Prácticas

- No hagas commits directamente sobre `main`.
- Seguí las convenciones de nombres de ramas.
- Usá `pull requests` para revisión de código antes de fusionar.
- Etiquetá las versiones siguiendo [SemVer](https://semver.org/).

<br>

### Stack de tecnologías utilizado

- Node.js
- NestJS
- TypeScript
- MongoDB
- Docker
- JSON Web Tokens
- CORS
- Bcrypt
- Cookie-parser
- Faker (desarrollador)

<br>

## Pasos para instalar dependencias del proyecto

1. Clonar el repositorio. Leé primero [Pasos a seguir con Gitflow](#pasos-a-seguir-con-gitflow).
2. Ejecutar

   ```bash
   $ npm install
   ```

3. Tener Nest CLI instalado

   ```bash
   $ npm i -g @nestjs/cli
   ```

4. Levantar la base de datos
   ```bash
   $ docker-compose up -d
   ```

<br>

## Ejecutando el proyecto

#### En entorno de `desarrollo`

1. Ejecutar desde una terminal:

   ```bash
   # Recarga automática de cambios en desarrollo
   $ npm run start:dev
   ```

2. Reconstruir la base de datos con datos de [_Faker_](https://www.npmjs.com/package/@faker-js/faker) en desarrollo:

   - Usando un navegador web, ingresar a: [http://localhost:3000/api/v1/seed](http://localhost:3000/api/v1/seed)
   - o desde [Postman](https://www.postman.com/):
     ```bash
     [GET] http://localhost:3000/api/v1/seed
     ```

<br>

#### En entorno de `producción`

- Ejecutar desde una terminal:

  1. Reconstruir la carpeta de compilación del proyecto

     ```bash
     $ npm build
     ```

  2. Ejecutar el proyecto en entorno de proudcción
     ```bash
     $ npm run start:prod
     ```

<br>

## Ejemplos de uso de la API con [Postman](https://www.postman.com/)

### Rutas de Seed

#### `Cargar la base de datos usando Faker` [Solo en desarrollo]

```bach
[GET] http://localhost:3000/api/v1/seed
```

<br>

### Rutas de Usuario

#### `Registrar un nuevo usuario` [Usuario no autenticado]

```bach
[POST] http://localhost:3000/api/v1/auth/register
```

- Body (JSON):

  ```json
  {
  	"name": "Nombre",
  	"lastname": "Apellido",
  	"email": "usuario@dominio.com",
  	"password": "Clave123"
  }
  ```

#### `Inicio de sesión` [Usuario no autenticado]

```bach
[POST] http://localhost:3000/api/v1/auth/login
```

- Body (JSON):

  ```json
  {
  	"email": "usuario@dominio.com",
  	"password": "Clave123"
  }
  ```

#### `Cerrar sesión` [Usuario autenticado]

```bach
[POST] http://localhost:3000/api/v1/auth/logout
```

- No requiere body.

#### `Recuperar contraseña` [Usuario no autenticado]

```bach
[POST] http://localhost:3000/api/v1/auth/forgot-password
```

- Body (JSON):

  ```json
  {
  	"email": "usuario@dominio.com"
  }
  ```

#### `Verificar token de restablecimiento de contraseña` [Usuario no autenticado]

```bach
[GET] http://localhost:3000/api/v1/auth/verify-token?token=TOKEN_AQUÍ
```

#### `Restablecimiento de contraseña` [Usuario no autenticado]

```bach
[POST] http://localhost:3000/api/v1/auth/reset-password
```

- Body (JSON):

  ```json
  {
  	"token": "TOKEN_AQUÍ",
  	"newPassword": "nueva123"
  }
  ```

#### `Información del usuario autenticado` [Usuario autenticado]

```bach
[GET] http://localhost:3000/api/v1/auth/me
```

#### `Paquetes del usuario autenticado` [Usuario autenticado con rol repartidor]

```bach
[GET] http://localhost:3000/api/v1/auth/me/packages
```

#### `Obtener todos los usuarios` [Usuario autenticado con rol administrador]

```bach
[GET] http://localhost:3000/api/v1/auth/users
```

#### `Obtener datos de un usuario específico` [Usuario autenticado con rol administrador]

```bach
[GET] http://localhost:3000/api/v1/auth/users/:userId
```

#### `Actualizar rol de un usuario` [Usuario autenticado con rol administrador]

```bach
[PUT] http://localhost:3000/api/v1/auth/users/:userId/role
```

- Body (JSON):

  ```json
  {
  	"roles": ["administrador"]
  }
  ```

#### `Cambiar estado de un paquete y reordenar` [Usuario autenticado con rol repartidor]

```bach
[PUT] http://localhost:3000/api/v1/auth/me/packages/:uuidPackage
```

- No requiere body.

#### `Actualizar paquetes del usuario autenticado` [Usuario autenticado con rol repartidor]

```bach
[PUT] http://localhost:3000/api/v1/auth/me/packages
```

- Body (JSON):

  ```json
  {
      "packages": ["ID_PAQUETE_1", "ID_PAQUETE_2", ...]
  }
  ```

#### `Cancelar un paquete` [Usuario autenticado con rol repartidor]

```bach
[PUT] http://localhost:3000/api/v1/auth/me/packages/:uuidPackage/cancel
```

- No requiere body.

#### `Marcar paquete como entregado` [Usuario autenticado con rol repartidor]

```bach
[PUT] http://localhost:3000/api/v1/auth/me/packages/:uuidPackage/finish
```

- No requiere body.

#### `Cambiar estado del usuario` [Usuario autenticado con rol administrador]

```bach
[PUT] http://localhost:3000/api/v1/auth/me/packages
```

- Body (JSON):

  ```json
  {
  	"state": "activo"
  }
  ```

#### `Eliminar usuario autenticado` [Usuario autenticado]

```bach
[DELETE] http://localhost:3000/api/v1/auth/me/delete
```

- No requiere body.

#### `Eliminar un usuario específico` [Usuario autenticado con rol administrador]

```bach
[DELETE] http://localhost:3000/api/v1/auth/users/:userId
```

- No requiere body.

<br>

### Rutas de Paquetes

#### `Obtener paquetes disponibles` [Usuario autenticado con rol repartidor]

```bach
[GET] http://localhost:3000/api/v1/packages/available
```

#### `Obtener paquetes entregados` [Usuario autenticado con rol repartidor]

```bach
[GET] http://localhost:3000/api/v1/packages/delivered
```

#### `Obtener detalles de un paquete específico` [Usuario autenticado con rol repartidor]

```bach
[GET] http://localhost:3000/api/v1/packages/at/:uuidPackage/details
```

#### `Crear un nuevo paquete` [Usuario autenticado con rol administrador]

```bach
[POST] http://localhost:3000/api/v1/packages/new
```

- Body (JSON):

  ```json
  {
  	"deliveryFullname": "Carlos López",
  	"deliveryAddress": "Calle Flasa 123",
  	"deliveryWeight": 3
  }
  ```

#### `Actualizar el estado de un paquete` [Usuario autenticado con rol administrador]

```bach
[PUT] http://localhost:3000/api/v1/packages/at/:packageId/state
```

- Body (JSON):

  ```json
  {
  	"state": "en curso"
  }
  ```

#### `Asignar un paquete a un repartidor` [Usuario autenticado con rol repartidor]

```bach
[PUT] http://localhost:3000/api/v1/packages/at/:packageId/assign
```

- Body (JSON):

  ```json
  {
  	"deliveryMan": "ID_REPARTIDOR"
  }
  ```

#### `Eliminar un paquete` [Usuario autenticado con rol administrador]

```bach
[DELETE] http://localhost:3000/api/v1/packages/at/:uuidPackage/remove
```

- No requiere body.

<br>

### Rutas de Ubicación (Google Maps)

#### `Obtener Ubicación de un Paquete` [Usuario autenticado con rol repartidor]

```bach
[GET] http://localhost:3000/api/v1/locations/package/:packageId

```

<br>

### Rutas de Reportes

#### `Reporte de repartidores disponibles por fecha` [Usuario autenticado con rol administrador]

```bach
[GET] http://localhost:3000/api/v1/reports/deliveryman/all/state/available/:year/:month/:day

```

#### `Reporte de detalles de estado de repartidores por fecha` [Usuario autenticado con rol administrador]

```bach
[GET] http://localhost:3000/api/v1/reports/deliveryman/all/state/details/:year/:month/:day

```

#### `Reporte de paquetes entregados por fecha` [Usuario autenticado con rol administrador]

```bach
[GET] http://localhost:3000/api/v1/reports/on/all/delivered/:year/:month/:day

```

#### `Reporte de paquetes entregados por repartidor y fecha` [Usuario autenticado con rol administrador]

```bach
[GET] http://localhost:3000/api/v1/reports/deliveryman/on/:uuidUser/delivered/:year/:month/:day

```

#### `Reporte de todos los paquetes por fecha` [Usuario autenticado con rol administrador]

```bach
[GET] http://localhost:3000/api/v1/reports/packages/all/:year/:month/:day

```

## Contribuir con el proyecto Box

Para contribuir al proyecto:

1. Forkeá el repositorio.
2. Creá una nueva rama `feature/` en tu fork.
3. Realizá tus cambios y hacé un commit.
4. Hacé un push de la rama a tu fork.
5. Abrí un pull request desde tu rama `feature/` hacia `develop` del repositorio original.

<br>

## Envianos tus comentarios

Por cualquier consulta, colaboración, inquitud o sugerencia, podés escribirnos por mail a *acep5box@gmail.com*

<br>

## Seguinos ;)

- Boris Manzano - [BorisManzano](https://github.com/BorisManzano)
- Javier Colodro - [Javierdigital85](https://github.com/Javierdigital85)
- Javier Trombetta - [javiertrombetta](https://github.com/javiertrombetta)
- Lucas Glave - [LucasGlave](https://github.com/LucasGlave)

<br>

## Licencias utilizadas

Nest es una licencia [MIT](LICENSE).
