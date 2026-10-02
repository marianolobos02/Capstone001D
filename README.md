# Capstone001D
Proyecto final de capstone

1.Nombre del proyecto: Academy7

2.Descripción: El Proyecto APT “Academy7” consiste en diseñar, desarrollar e implementar un sistema web que reemplace el uso de libros de clase físicos, permitiendo el registro y la consulta en tiempo real de calificaciones, asistencia, observaciones y evaluaciones. La plataforma contempla un módulo de gestión académica, un módulo de comunicación (notificaciones y reportes) y un módulo de seguridad y respaldo de datos.
Este proyecto surge a partir de un problema real observado en instituciones educativas de menor tamaño, que actualmente gestionan la información académica mediante libros de clase físicos. Este método genera retrasos, riesgo de pérdida de información y dificulta la comunicación entre docentes, inspectores, estudiantes y apoderados. Elegimos este tema porque refleja una problemática vigente y extendida en el sector educativo chileno, donde la digitalización aún no ha llegado a todas las instituciones, especialmente a colegios con menos recursos tecnológicos. La solución propuesta es relevante para el campo laboral de Ingeniería en Informática porque combina desarrollo de software, diseño de bases de datos y evaluación de proyectos, competencias centrales del perfil de egreso. El proyecto impacta directamente a docentes, inspectores, estudiantes y apoderados de la institución educativa, y su valor agregado (real o simulado) consiste en centralizar la información académica, reducir errores administrativos y mejorar la comunicación entre los distintos actores de la comunidad educativa.

3.Tecnologías utilizadas :
lenguajes: JavaScript, Css y HTML
base de datos: Firebase
Apps utilizadas: Github, github desktop, Visual Studio Code, Chrome.


4.Instrucciones para ejecutar el proyecto localmente
Antes de cualquier paso se debe descargar node.js desde la pagina original.

Luego de esto, procuramos tener instalado VIsual Studio Code y Github desktop. Cuando ya verificamos esto, abriremos nuestro github desktop, seleccionaremos el repositorio correspondiente y apretaremos el botón azul el cual dice "Open in Visual Studio Code", al hacer esto nuestro dispositivo automaticamente abrirá el proyecto dentro de Visual. De esta forma ya podremos visuaalizar nuestro codigo.

PERO ATENCIÖN ESTO NO QUIERE DECIR QUE YA ESTAREMOS VISUALIZANDO LA PAGINA YA QUE PARA VISUALIZARLA SEGUIREMOS LOS SGTES PASOS:

Cuando ya contamos con el archivo abierto dentro de Visual, haremos click derecho sobre la carpeta "Evidencias del proyecto", abrimos una terminal en la cual escribiremos el codigo:

py -m http.server 8080

Finalmente cuando este codigo corra, iremos a nuestro navegador de preferencia Google Chrome y pegaremos la URL http://localhost:8080/index.html

Llegados a este punto ya tendremos abierto nuestro codigo y tambien su visualización en nuestro navegador.


Integrantes del equipo con sus roles

Alex Hernandez: Scrum master y developer
Mariano Lobos: Product Owner y developer

Metodología de trabajo del equipo: Metodología Ágil Scrum


Arquitectura de la solución: Arquitectura de la solución
Arquitectura de la solución

La solución estará basada en una arquitectura web de tres componentes principales:

1. Interfaz de usuario (Frontend): permitirá el acceso a la plataforma según el tipo de usuario (docente, estudiante y apoderado), facilitando la consulta y gestión de información académica.

2. Lógica de negocio (Backend): procesará las operaciones del sistema, como gestión de calificaciones, asistencia, observaciones, reportes, notificaciones y control de usuarios.

3. Base de datos: almacenará de forma centralizada y segura la información académica y de los usuarios, permitiendo su actualización y consulta en tiempo real.

La arquitectura permitirá integrar los módulos de gestión académica, comunicación y seguridad, manteniendo la información centralizada y accesible desde la plataforma web. El desarrollo será incremental y posteriormente se realizarán pruebas e implementación piloto.
