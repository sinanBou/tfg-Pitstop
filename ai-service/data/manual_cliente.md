# Manual de Usuario - Área del Cliente (Pitstop)

Bienvenido a Pitstop, la plataforma de gestión de mantenimiento y citas para vehículos. Este manual detalla todas las herramientas y secciones disponibles en tu Panel de Cliente para gestionar tus vehículos, solicitar citas coordinadas con el taller en tiempo real, realizar un seguimiento de los trabajos en curso, y controlar detalladamente tus gastos y facturas oficiales.

---

## 1. Gestión de mis Vehículos (Mi Garaje)

Desde la pestaña de Vehículos puedes dar de alta y administrar tu garaje personal de forma centralizada:

*   **Registrar un Vehículo**: Haz clic en el botón Añadir Nuevo Vehículo. Deberás completar un formulario interactivo con los siguientes datos:
    *   **Marca**: Seleccionable a través de un buscador predictivo conectado a nuestro catálogo general de fabricantes. Cuenta con accesos rápidos para las marcas más habituales.
    *   **Modelo**: Una vez seleccionada la marca, el sistema filtra y despliega de manera dinámica los modelos específicos de ese fabricante en el catálogo.
    *   **Matrícula**: Identificador obligatorio del vehículo. Debe seguir un formato estándar (por ejemplo, 0000XXX) y ser único en el sistema. El servidor validará en tiempo real que no esté registrada previamente.
    *   **Año de Fabricación/Matriculación**: Campo numérico obligatorio para determinar la antigüedad del coche.
    *   **Número de Chasis (VIN)**: Identificador alfanumérico único del bastidor, opcional pero altamente recomendado para mayor precisión en la búsqueda de repuestos.
    *   **Color**: Campo de texto opcional para especificar el color del vehículo (ej. Negro Mate, Rojo Metalizado).
*   **Ficha de Vehículo y Acciones**: Cada vehículo registrado se muestra en una tarjeta individual dentro del garaje. Al hacer clic en ella, podrás ver su ficha técnica completa y el historial de mantenimiento asociado.
*   **Eliminación Segura**: Si deseas dar de baja un vehículo, puedes usar el botón de eliminación en la tarjeta. Esto abrirá un modal de confirmación explicando que se eliminará la información del vehículo de tu garaje junto con sus citas y tareas de taller asociadas.
*   **Previsualización de Imágenes**: Siempre que haya fotografías vinculadas a las fichas técnicas o a las intervenciones de mantenimiento, podrás hacer clic en ellas para visualizarlas en una pantalla completa interactiva.

---

## 2. Solicitud Automatizada de Citas (Agendar Cita)

El proceso para programar una cita en Pitstop está completamente automatizado y sincronizado en tiempo real con la capacidad laboral del taller mediante un asistente interactivo de cuatro pasos:

1.  **Paso 1: Selección de Vehículo**: Elige uno de los vehículos registrados en tu garaje.
    *   *Restricción por duplicación*: Para garantizar la integridad del sistema, no se permite solicitar una cita para un vehículo si ya cuenta con una cita activa (es decir, en cualquier estado excepto Cancelada) programada para ese mismo taller. El sistema emitirá una advertencia y bloqueará el paso al siguiente formulario.
2.  **Paso 2: Selección de Taller**: Escribe en el buscador predictivo el nombre o dirección del taller oficial deseado. La búsqueda cuenta con retardo automático (debounce) para no saturar el servidor y paginación infinita. Además, puedes previsualizar los logotipos y fachadas del taller seleccionándolos.
3.  **Paso 3: Selección de Horario**:
    *   Elige un día laborable dentro del calendario interactivo del taller seleccionado. El sistema valida automáticamente los días de apertura y de descanso de cada taller.
    *   Una vez seleccionado el día, el sistema consulta en tiempo real las horas disponibles segmentadas en bloques de una hora (ej. 09:00, 10:00, 16:00).
    *   La disponibilidad horaria se calcula dinámicamente según la capacidad real del taller (número de mecánicos activos asignados en ese horario, más el propietario si está marcado como operario activo en la planificación). Si se alcanza el límite de coches que se pueden recibir en esa hora, la franja aparecerá inhabilitada en el selector.
4.  **Paso 4: Detalles del Servicio y Confirmación**:
    *   Selecciona la tipología del servicio a contratar (Mantenimiento general, Frenos, Transmisión, Electricidad, Neumáticos, Motor, etc.).
    *   Describe brevemente en el campo de comentarios el motivo de la cita, ruidos percibidos, o fallos que desees que el mecánico revise.
    *   Haz clic en Confirmar para enviar la solicitud. Tu cita se registrará en estado Pendiente de aprobación en el taller.

---

## 3. Seguimiento de Estados y Ciclo de Vida del Vehículo

En la pestaña Citas puedes ver las tarjetas de tus reservas activas con su estado correspondiente actualizado en tiempo real:

*   **Pendiente**: La cita ha sido registrada con éxito en el sistema. El personal del taller está revisando la carga de trabajo para confirmar la cita y asignar un mecánico responsable.
*   **Confirmada**: El taller ha aprobado tu cita y ha asignado formalmente a un mecánico de su plantilla para atenderte en el día y hora reservados.
*   **En Proceso**: Tu vehículo ha sido entregado en el taller físico y el mecánico ha iniciado los trabajos técnicos correspondientes. El tiempo de reparación estimado comienza a contabilizarse.
*   **Retrasada**: Si durante la reparación se detecta algún problema imprevisto, falta de stock de recambios, o el tiempo se extiende más de lo previsto, el estado cambiará a una alerta visual parpadeante en rojo para notificarte de inmediato.
*   **Completada**: El trabajo mecánico ha finalizado con éxito. En este momento el estado se muestra como Listo para Recoger, indicándote que ya puedes acudir al taller a retirar tu vehículo.
*   **Recogido**: Has retirado físicamente tu vehículo de las instalaciones del taller. La cita se archiva en tu historial financiero y se genera la factura definitiva.
*   **Cancelada**: La reserva ha sido anulada.
    *   *Política de Cancelación*: Un cliente puede cancelar libremente sus citas desde el panel solo si estas se encuentran en estado Pendiente o Confirmada. Una vez que el coche ha entrado al taller físico y el estado pasa a En Proceso, Retrasada, Completada o Recogido, el botón de cancelación quedará inhabilitado.

---

## 4. Actividad, Notificaciones y Facturación

El Panel del Cliente cuenta con dos herramientas principales de control financiero y de comunicaciones:

### A. Pestaña de Notificaciones y Actividad
Muestra un registro cronológico de todas las actualizaciones relevantes sobre tus vehículos en el taller, detallando la fecha y la hora exacta de cada evento:
*   Confirmación de citas programadas.
*   Avisos de finalización de trabajos mecánicos.
*   Generación de facturas una vez que el vehículo ha sido retirado.
*   Notificaciones de cancelación o rechazo de citas por parte del taller.
*   **Descarga Directa**: Junto a cada notificación de factura generada, se incluye un botón para abrir y descargar la factura simplificada en PDF oficial de forma inmediata.

### B. Pestaña de Informes y Gastos
Funciona como tu analista financiero personal de automoción para el período seleccionado:
*   **Selector Mensual**: Permite filtrar las métricas y el historial de facturas por meses específicos o visualizar los acumulados totales de todos los tiempos.
*   **Indicadores Clave (KPIs)**: Muestra de un vistazo cuatro métricas financieras: Gasto Acumulado en el taller, Citas Totales registradas, Mi Flota (número de vehículos activos) y Precio Medio por reparación.
*   **Gráficas de Gastos por Vehículo**: Muestra de forma visual con barras de progreso comparativas qué porcentaje del presupuesto total de mantenimiento se ha destinado a cada uno de tus vehículos, indicando también el número total de reparaciones acumuladas.
*   **Historial de Últimas Facturas**: Lista las últimas cinco facturas emitidas en el periodo de tiempo seleccionado con la marca del coche, servicio realizado, fecha y coste final. Al hacer clic en el botón PDF se genera e imprime un documento con el membrete oficial del taller, el coste por hora de mano de obra del mecánico, el número de horas empleadas y las piezas de repuesto utilizadas.

---

## 5. Gestión del Perfil del Cliente

Al hacer clic en el botón de perfil de la esquina superior derecha, accederás a la configuración de tu cuenta personal:

*   **Actualización de Datos Personales**: Permite editar tu nombre, apellidos, dirección de residencia (que cuenta con un buscador predictivo para rellenar la dirección de forma ágil) y tu número de teléfono móvil de contacto.
*   *Nota sobre Foto de Perfil*: Por políticas de privacidad y simplicidad del sistema, no se permite la subida de fotos de perfil de usuario. En su lugar, el panel generará automáticamente un avatar con las iniciales de tu nombre y apellido.
*   **Cambio de Credenciales**: Permite restablecer y actualizar de manera segura la contraseña de acceso al panel de cliente.
