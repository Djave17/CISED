# Documentación de Servicios

Este directorio contiene la lógica de negocio de la aplicación, separada de los controladores para mantener un código más limpio y modular.

## Archivos de Servicio

A continuación se describe la responsabilidad de cada archivo de servicio:

-   `academic.service.js`: Gestiona las operaciones relacionadas con los datos académicos. Se encarga de obtener toda la información académica y de crear nuevas facultades y programas.

-   `evaluation.service.js`: Maneja la lógica para la creación y almacenamiento de las evaluaciones enviadas a través de los diferentes formularios.

-   `program.service.js`: Se encarga de la lógica para crear programas académicos, ya sea de forma individual o en lotes.

-   `questionform.service.js`: Provee la funcionalidad para obtener la estructura y las preguntas de los diferentes tipos de formularios (ej. estudiante, profesor).

-   `report.service.js`: Centraliza la lógica para la generación de reportes, principalmente obteniendo todos los datos de las evaluaciones.
