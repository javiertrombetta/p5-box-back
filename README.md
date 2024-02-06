<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="./public/assets/img/box.png" width="400" alt="Box" /></a>
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
* Nest
* MongoDB

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

5. Reconstruir la base de datos con datos aleatorios
```bash
http://localhost:3000/api/v1/seed
```

<br>

## Ejecutando el proyecto

```bash
# Entorno de desarrollo
$ npm run start

# Recarga automática por cambios en desarrollo
$ npm run start:dev

# Entorno de producción
$ npm build
$ npm run start:prod
```

<br>

## Ejecutando los tests

```bash
# Realizar tests unitarios
$ npm run test

# Realizar tests e2e (END-TO-END)
$ npm run test:e2e

# Realizar tests de covertura
$ npm run test:cov
```

<br>

### Contribuir

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

## Seguinos :)

- Boris Manzano - [BorisManzano](https://github.com/BorisManzano)
- Javier Colodro - [Javierdigital85](https://github.com/Javierdigital85)
- Javier Trombetta - [javiertrombetta](https://github.com/javiertrombetta)
- Lucas Glave - [LucasGlave](https://github.com/LucasGlave)

<br>

## Licencias utilizadas

Nest es una licencia [MIT](LICENSE).
