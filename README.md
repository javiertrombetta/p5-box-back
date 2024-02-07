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


## Uso de la API con [Postman](https://www.postman.com/)


### Endpoint `Seed`

```bach
[GET] http://localhost:3000/api/v1/seed
```

- Respuesta esperada:
  
    ```json
    {        
        "message": "Base de datos reconstruida con datos de Faker."
    }
    ```

### Endpoint `Register`
```bach
[POST] http://localhost:3000/api/v1/auth/register
```

- Incluir el siguiente Body en formato JSON:

    ```json
    {
        "fullName": "Nombre Apellido",
        "email": "usuario@dominio.com",
        "password": "CalleFalsa123"
    }
    ```

- Respuesta esperada:
  
    ```json
    {
        "fullName": "Nombre Apellido",
        "email": "usuario@dominio.com",
        "message": "Usuario registrado con éxito."
    }
    ```

### Endpoint `Login`
```bach
[POST] http://localhost:3000/api/v1/auth/login
```

- Incluir el siguiente Body en formato JSON:

    ```json
    {
        "email": "usuario@dominio.com",
        "password": "CalleFalsa123"
    }
    ```

- Respuesta esperada:
  
    ```json
    {
        "fullName": "Nombre Apellido",
        "email": "usuario@dominio.com",
        "message": "Usuario logueado con éxito."
    }
    ```
<br>

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
