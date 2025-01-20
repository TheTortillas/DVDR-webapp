# DVDR-webapp

DVDR-webapp es una aplicación de gestión de cursos diseñada para la Dirección de Vinculación y Desarrollo Regional (DVDR). Permite administrar cursos, inscripciones y usuarios. La aplicación está desarrollada utilizando Angular como framework principal, junto con Angular Material, NGXtension y Tailwind CSS para una mejor experiencia de usuario.

## Proyecto Frontend

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 18.2.8. La aplicación utiliza además Angular Material, NGXtension y Tailwind CSS para la construcción de interfaces y funcionalidades adicionales.

### Estructura del Proyecto

- **Angular CLI:** Herramienta de línea de comandos para la creación y manejo de proyectos Angular.
- **Angular Material:** Biblioteca para implementar componentes de UI estilizados.
- **NGXtension:** Extensiones que añaden funcionalidades avanzadas en Angular.
- **Tailwind CSS:** Framework de CSS para crear interfaces estilizadas utilizando clases utilitarias.

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu máquina antes de iniciar el proyecto:

- [Node.js](https://nodejs.org/) (versión recomendada: 14.x o superior).
- [Angular CLI](https://angular.dev/cli).

## Instalación

Sigue los pasos a continuación para configurar el proyecto localmente:

1. Clona el repositorio:
   ```sh
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega a la carpeta `Frontend`:
   ```sh
   cd Frontend
   ```
3. Instala las dependencias:
   ```sh
   npm install
   ```

## Servidor de Desarrollo

Ejecuta el siguiente comando para iniciar el servidor de desarrollo:

```sh
ng serve
```

Luego, abre tu navegador y navega a http://localhost:4200/. La aplicación se recargará automáticamente al realizar cambios en los archivos fuente.

## Comandos de Angular CLI

Aquí tienes una lista de los comandos más utilizados para trabajar con Angular:

Generar un componente nuevo:

```sh
ng generate component nombre-del-componente
```

También puedes generar otros tipos de elementos como directivas, pipes, servicios, clases, guardias, interfaces, enums y módulos:

```sh
ng generate directive|pipe|service|class|guard|interface|enum|module
```

Compilar la aplicación:

```sh
ng build
```

Los artefactos generados se almacenarán en la carpeta `dist/`.

Ejecutar pruebas unitarias:

```sh
ng test
```

Esto ejecutará las pruebas unitarias mediante Karma.

Pruebas end-to-end:

```sh
ng e2e
```

Para esto, es necesario añadir primero un paquete que implemente capacidades de pruebas end-to-end.

## Dependencias Extra

## Angular Material

Angular Material proporciona un conjunto de componentes reutilizables y estilizados que siguen las guías de diseño de Material Design. Puedes consultar más sobre su instalación y uso en la [documentación oficial de Angular Material](https://material.angular.io/).

## NGXtension

NNGXtension es una colección de extensiones que amplían las funcionalidades predeterminadas de Angular. Más información en la [documentación oficial de NGXtension](https://github.com/ngxtension/ngxtension).

## Tailwind CSS

Tailwind CSS es un framework CSS basado en utilidades, lo que te permite crear diseños de forma rápida sin escribir mucho CSS personalizado. Puedes encontrar más información en la [documentación oficial de Tailwind CSS](https://tailwindcss.com/).

## Scripts Disponibles

En la carpeta del frontend, puedes ejecutar los siguientes comandos:

- `ng serve`: Inicia el servidor de desarrollo en http://localhost:4200/.
- `ng build`: Genera una compilación de la aplicación optimizada para producción.
- `ng test`: Ejecuta las pruebas unitarias utilizando Karma.

## Contribuir

Si deseas contribuir a este proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad o corrección (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz un commit con un mensaje descriptivo (`git commit -am 'Añadir nueva funcionalidad'`).
4. Sube tus cambios al repositorio remoto (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request para que podamos revisar tus cambios.

## Issues

Aquí hay algunos enlaces a problemas y soluciones que hemos encontrado durante el desarrollo:

- https://stackoverflow.com/questions/58587593/angular-material-dialog-mat-dialog-actions-position
- https://stackoverflow.com/questions/53020792/how-to-set-width-of-mat-table-column-in-angular
- https://stackoverflow.com/questions/50718485/angular-material-button-is-in-select-state-on-dialog-open
- https://angular.dev/update-guide?v=18.0-19.0&l=3
- https://stackoverflow.com/questions/43447688/setting-up-swagger-asp-net-core-using-the-authorization-headers-bearer
- https://stackoverflow.com/questions/62986290/cant-use-angular-material-date-range-date-filter
- https://stackoverflow.com/questions/52316898/how-do-i-center-angular-material-table-column-headers-and-mat-cell-content
- https://stackblitz.com/edit/mat-dialog-full-width?file=app%2Fapp.component.ts

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
