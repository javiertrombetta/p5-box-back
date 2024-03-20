<p align="center">
  <a href="https://github.com/javiertrombetta/p5-box-back" target="blank"><img src="./public/assets/img/box.png" width="400" alt="Box" /></a>
</p>

![Static Badge](https://img.shields.io/badge/TypeScript-typescriptlang.org-blue)
![Static Badge](https://img.shields.io/badge/JavaScript-nodejs.org-darkgreen)
![Static Badge](https://img.shields.io/badge/NestJS-nestjs.com-red)
![Static Badge](https://img.shields.io/badge/MongoDB-mongodb.com-green)
![Static Badge](https://img.shields.io/badge/Docker-docker.com-blue)


![Static Badge](https://img.shields.io/badge/SERVICIOS%20PREVIAMENTE%20DISPONIBILIZADOS:-grey)
![Static Badge](https://img.shields.io/badge/Google%20OAuth%202.0-darkred)
![Static Badge](https://img.shields.io/badge/Google%20Maps%20RoutesAPI-darkred)
![Static Badge](https://img.shields.io/badge/AWS%20S3-darkred)



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

## Usando el proyecto en distintos entornos

### Entorno de `desarrollo local`

#### **_Requerimientos_**: [Docker](https://www.docker.com/), compatible para tu sistema operativo. Una vez instalado, asegurarse que el Engine de Docker se encuentre ejecutándose.

- ### Inicializar proyecto en entorno de `desarrollo`

  1. Clonar el repositorio. Leé primero [Pasos a seguir con Gitflow](#pasos-a-seguir-con-gitflow).
  2. Instalar todas las dependencias del proyecto:

     ```bash
     $ npm install
     ```

  3. Instalar Nest CLI:

     ```bash
     $ npm i -g @nestjs/cli
     ```

  4. Clonar el archivo `.env.template` y renombar la copia a `.env`

  5. Completar con datos reales las variables de entorno definidas en el `.env`

  6. Desplegar y ejecutar MongoDB en segundo plano:

     ```bash
     $ docker-compose -f docker-compose.yaml up -d
     ```

  7. Ejecutar desde una terminal:

     ```bash
     # Recarga automática de cambios en entorno de desarrollo
     $ npm run start:dev
     ```

  8. Reconstruir la base de datos con datos de [_Faker_](https://www.npmjs.com/package/@faker-js/faker) en desarrollo:

     - Usando un navegador web, ingresar a: [http://localhost:3000/api/v1/seed](http://localhost:3000/api/v1/seed)
     - o desde [Postman](https://www.postman.com/):

       ```bash
       [GET] http://localhost:3000/api/v1/seed
       ```

<br>

- ### Compliar el proyecto para usar la RestAPI en entorno de `producción`

  1. Clonar el archivo `.env.template` y renombar la copia a `.env.prod`

  2. Completar con datos reales las variables de entorno definidas en el `.env.prod`

  3. Tener una base de datos de MongoDB ya configurada; o ejecutar el siguiente comando para desplegar y ejecutar la imagen de Docker Hub:

     ```bash
     $ docker-compose -f docker-compose.yaml up -d
     ```

  4. Ejecutar desde una terminal:

     ```bash
     # Compilar el proyecto en la carpeta ./dist
     $ npm run build
     ```

  5. Ejecutar desde una terminal y en la carpeta raíz:
     ```bash
     # Ejemplo: Para ejecutar la API en un servicio de host terciarizado. Se requiere tener el proyecto disponibilizado en un repositorio externo.
     $ node dist/main
     ```

<br>

- ### Crear una imagen Docker para uso en entorno de `producción`

  1. Crear el archivo `.env.prod`
  2. Llenar las variables de entorno de prod
  3. Crear la nueva imagen:
     ```
     docker-compose -f docker-compose.prod.yaml --env-file .env.prod up --build
     ```

- ### Utilizar la imagen del proyecto disponible en [Docker Hub](https://hub.docker.com/)

  1. Ejecutar desde una terminal:

     ```bash
     # Descargar la última versión de la imagen del proyecto
     $ docker pull javiertrombetta/box-back
     ```

  2. Ejecutar desde una terminal:

     ```bash
     # Iniciar el contenedor desde la imagen descargada
     $ docker container run -d -p 80:80 javiertrombetta/box-back
     ```

<br>

## Documentación de las rutas con [Swagger](https://swagger.io/)


**Box** utiliza Swagger para proporcionar documentación interactiva de las rutas, modelos y controladores. Swagger no solo facilita la comprensión de las capacidades de la API, sino que también permite probar las endpoints directamente desde la interfaz web.

Acceso a la documentación Swagger
Para acceder a la documentación Swagger de la API, visita la siguiente URL en tu navegador:

```bash
http://localhost:3000/api
```

Accediendo a esta url, podés encontrarte con la interfaz de usuario de Swagger. Tenés todas las rutas disponibles del proyecto, sus descripciones, parámetros, respuestas esperadas y otros detalles importantes.

<br>

### Cómo utilizar la documentación
Una vez en la página de documentación de Swagger, podés expandir cada ruta para ver detalles específicos. 

La documentación incluye:

- **Resumen y Descripción**: Breve explicación de lo que hace la ruta.
- **Parámetros**: Lista de parámetros que acepta la ruta, incluyendo si son obligatorios u opcionales, y ejemplos de valores.
- **Respuestas**: Códigos de respuesta HTTP posibles y sus descripciones, junto con modelos de respuesta para comprender mejor la estructura de los datos retornados.
- **Pruebas en vivo**: Swagger permite realizar llamadas de prueba a la API directamente desde la interfaz. Solo necesitás completar los parámetros requeridos y hacer click en `Try it out`.
- **Autenticación**: Para las rutas que requieren autenticación, asegurate de obtener un token válido (usualmente a través de una ruta de login o registro) y utilizar el botón `Authorize` disponible en la parte superior de la página de documentación Swagger. Esto te permitirá ingresar el token y realizar solicitudes autenticadas.
- 

<br>

## Contribuir con el proyecto Box

Para contribuir al proyecto:

1. Forkeá el repositorio.
2. Creá una nueva rama `feature/` en tu fork.
3. Realizá tus cambios y hacé un commit.
4. Hacé un push de la rama a tu fork.
5. Abrí un pull request desde tu rama `feature/` hacia `develop` del repositorio original.

<br>

### Soporte y Feedback
Si tenés preguntas, encontrás errores, querés colaborar o proporcionar feedback sobre la documentación y/o la API, no dudes en contactar al equipo de desarrollo por mail a **acep5box@gmail.com**.

<br>

## Seguinos ;)

- Boris Manzano - [BorisManzano](https://github.com/BorisManzano)
- Javier Colodro - [Javierdigital85](https://github.com/Javierdigital85)
- Javier Trombetta - [javiertrombetta](https://github.com/javiertrombetta)
- Lucas Glave - [LucasGlave](https://github.com/LucasGlave)

<br>

## Licencias utilizadas

Nest es una licencia [MIT](LICENSE).