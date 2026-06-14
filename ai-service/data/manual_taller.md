# Manual Operativo del Taller (Pitstop Admin & Staff)

Este manual técnico y de operaciones está dirigido a todo el personal del taller: mecánicos (WORKSHOP_STAFF), gerentes (WORKSHOP_MANAGER) y propietarios (WORKSHOP_OWNER). Describe de forma rigurosa los flujos de trabajo, políticas del taller, restricciones de planificación e integraciones de software implementadas en el panel administrativo de Pitstop.

---

## 1. Panel de Planificación y Línea de Tiempo (Timeline)

La pestaña de Planificación constituye el núcleo operativo del taller. Se organiza como un panel interactivo tipo Gantt/Kanban con las siguientes directrices de funcionamiento:

*   **Distribución Horaria y Columnas**: El eje vertical representa la jornada laboral del taller segmentada en intervalos de 30 minutos. Cada columna representa la agenda diaria individual de un operario o mecánico activo del taller.
*   **Columna Sin Asignar**: Situada en el lateral izquierdo, funciona como una bandeja de entrada. Muestra las citas confirmadas pendientes de asignación de personal y las tareas huérfanas sin mecánico responsable.
*   **Gestión por Arrastre (Drag and Drop)**: Permite planificar el trabajo arrastrando las citas desde la columna Sin Asignar hacia la agenda de un mecánico concreto en una hora específica. También permite reasignar tareas entre mecánicos arrastrando el bloque entre columnas.
*   **Restricciones de Cambio de Hora (Rescheduling Lock)**:
    *   *Citas de Clientes*: Para proteger el derecho del cliente a ser atendido en la hora acordada, las citas ordinarias tienen bloqueada su hora de reserva. Si arrastras la cita para reasignarla a otro mecánico o moverla de día, el sistema mantendrá la hora original y devolverá el bloque a esa misma franja. La única forma de reprogramar libremente la hora de una cita mediante arrastre es que esta se encuentre en estado Retrasada o haya sido desbloqueada explícitamente desde el Panel de Avisos.
    *   *Tareas internas del Taller*: No están sujetas a esta restricción y el planificador puede reprogramar su hora libremente arrastrándola.

---

## 2. Parámetros de Operación e Inclusión del Propietario

Los administradores del taller pueden definir la configuración básica del negocio desde el panel de ajustes:

*   **Configuración General**: Permite establecer el horario de apertura y cierre del taller, la duración estándar de los intervalos de cita (por defecto 60 minutos), el precio base de la mano de obra por hora (€/h) y los días laborables de la semana.
*   **Inclusión del Propietario en la Planificación**:
    *   Opción diseñada para talleres de tamaño reducido donde el dueño también realiza tareas de reparación física.
    *   Al activarse esta opción, el sistema aumenta automáticamente la capacidad del taller en un cupo extra por hora (capacidad = mecánicos activos + 1).
    *   Se añade una columna de planificación específica para el Propietario en el Timeline, y los clientes pueden seleccionar horas adicionales que antes estaban completas.
    *   *Desactivación*: Al desactivarse la opción, las citas que ya estuvieran confirmadas en la agenda del dueño se mantienen intactas en la base de datos para no alterar la planificación existente de los clientes, pero se impide asignar nuevas citas a su columna.

---

## 3. Gestión de Avisos, Alertas de Inventario e Incidencias

La pestaña de Avisos centraliza los eventos que requieren atención inmediata del personal, organizados en dos paneles diferenciados:

### A. Alertas de Stock Bajo en Almacén
*   Identifica y lista automáticamente todos aquellos repuestos y materiales de almacén cuyas existencias actuales se encuentren en un nivel inferior o igual al límite mínimo de advertencia (umbral de stock configurado para cada pieza).
*   Cada repuesto muestra una barra de progreso visual que indica el nivel crítico de desabastecimiento.
*   **Edición Rápida**: Puedes hacer clic en la tarjeta del repuesto en alerta para abrir un modal de edición directa. Esto permite actualizar su stock actual, modificar el umbral de alerta, actualizar la referencia OEM, el fabricante, la categoría de almacén o los precios de compra y venta sin necesidad de abandonar la pestaña de avisos.

### B. Gestión de Incidencias y Retrasos de Trabajo
*   **Activar Retraso**: Si el mecánico prevé que una reparación va a exceder el tiempo estimado originalmente o falta una pieza de repuesto crítica, puede marcar la cita o tarea como retrasada. Esto cambiará su estado a Retrasada y activará una alerta visual parpadeante en rojo tanto en el Timeline como en el Panel de Avisos.
*   **Acción de Desbloqueo y Reprogramación**: Al pulsar el botón "Ir a Planificación" en la tarjeta de incidencia del Panel de Avisos, el sistema realiza tres acciones simultáneas:
    1.  Oculta y descarta el aviso de la interfaz (guardando el descarte en el almacenamiento local del navegador).
    2.  Elimina el bloqueo de reprogramación de la cita, permitiéndote cambiar su hora de inicio libremente en el calendario mediante arrastre sin que el bloque retorne a su hora inicial.
    3.  Redirige de manera automática al Timeline en la fecha correspondiente para que realices la reubicación horaria de forma inmediata.

---

## 4. Recepción física de Vehículos (Gatekeeper Pattern)

Para garantizar un control de calidad riguroso y cumplir con los protocolos de seguridad industrial, el sistema implementa la restricción de seguridad denominada Gatekeeper:

*   Ningún mecánico puede iniciar los trabajos en una cita, registrar tareas técnicas, ni asignar repuestos a la orden de trabajo si el vehículo no ha sido **recibido físicamente en las instalaciones del taller**.
*   Las herramientas de gestión de la cita aparecerán bloqueadas con un candado de seguridad en el panel administrativo.
*   **Check-in del Vehículo**: Para desbloquear la cita, el operario debe realizar el check-in físico haciendo clic en "Recepcionar Coche". Deberá rellenar los kilómetros actuales registrados en el odómetro y añadir notas sobre posibles daños previos detectados en la carrocería o el estado del vehículo en la entrega. Al guardar, el vehículo pasará al estado "RECIBIDO" y se desbloquearán las tareas y recambios para esa orden.

---

## 5. Gestión de Tareas y Reparto de Duración (Task Splitting)

Cuando el mecánico gestiona una cita de reparación activa (con vehículo previamente recepcionado):

*   **Planificación del Servicio**: Puede seleccionar los códigos del catálogo técnico asociados a las reparaciones requeridas por el cliente y estimar la duración total del trabajo en minutos.
*   **Algoritmo de División de Tareas (Task Splitting)**:
    *   Si la duración total estimada de las tareas mecánicas excede las horas laborables que restan en el día actual (calculadas como la diferencia entre la hora de inicio de la cita y la hora de cierre del taller), el sistema **distribuye el trabajo automáticamente en varias jornadas**.
    *   El sistema crea una primera tarea para el día de hoy que consume exactamente los minutos restantes de la jornada actual.
    *   El tiempo restante se divide en tareas de continuación para los días laborables consecutivos, programadas a la hora de apertura del taller y respetando la capacidad diaria del taller (diferencia entre horas de apertura y cierre). El algoritmo excluye automáticamente los sábados y domingos de esta distribución.
    *   A las tareas de los días siguientes se les añade de forma automática la etiqueta "(Cont.)" en su descripción para identificarlas como continuación del trabajo original.
*   **Políticas de Eliminación de Tareas**:
    *   *Tareas distribuidas (multi-día)*: Si decides eliminar un bloque de trabajo diario perteneciente a una tarea que fue dividida por el algoritmo, solo se cancelará la parte de la tarea correspondiente a ese día específico.
    *   *Tareas de un único día*: Si eliminas una tarea que está contenida en un único día, el sistema la borrará por completo del registro y la cita origen volverá a estar en estado confirmada, pero sin mecánico asignado.
*   **Filtro por Especialidad**: Para evitar errores y mantener la especialización técnica, los mecánicos solo pueden visualizar e incorporar a la orden de trabajo aquellas tareas del catálogo que pertenezcan a las áreas técnicas autorizadas (secciones permitidas) especificadas en su ficha personal de equipo.

---

## 6. Almacén e Integración de Precios de Repuestos

*   **Asignación de Materiales**: El personal puede buscar y añadir repuestos del almacén a la orden de trabajo. Al hacerlo, el sistema descuenta inmediatamente el número de piezas de las existencias de inventario para evitar desfases de stock físico.
*   **Cálculo de Precios por Estrategia**: El sistema aplica el patrón de diseño de estrategia de precios para calcular los importes de los recambios asignados:
    *   *Estrategia Estándar*: Aplica directamente el precio de venta al público (PVP) registrado en la ficha del repuesto en almacén.
    *   *Estrategia de Descuento*: Si el administrador define un porcentaje de descuento en la orden para una pieza concreta, el sistema calculará dinámicamente el precio final deduciendo dicho porcentaje del PVP base.

---

## 7. Gestión de Plantilla y Restricciones de Acceso

El sistema de gestión de personal se rige por una estricta jerarquía de roles:

*   **Privilegios del Propietario (WORKSHOP_OWNER)**: Solo el usuario propietario del taller tiene el privilegio administrativo exclusivo para dar de alta nuevos empleados, ascender mecánicos a Gerentes (WORKSHOP_MANAGER), degradar gerentes a Mecánicos (WORKSHOP_STAFF), o dar de baja (despedir) de forma definitiva a cualquier miembro del equipo.
*   **Permisos Granulares por Secciones**: Los gerentes y el propietario pueden editar el perfil de acceso de los mecánicos de plantilla en la pestaña de Equipo. Esto permite seleccionar de forma individual a qué pestañas del panel de administración del taller tienen acceso (Planificación, Avisos, Citas, Tareas, Almacén, Finalizados, Informes). Si una pestaña no está activada para un mecánico, el sistema la ocultará de su panel lateral de navegación, restringiendo su visualización e interacción.

---

## 8. Trabajos Completados, Facturación y Check-out

*   **Pestaña Finalizados**: Lista de forma ordenada todas aquellas citas en estado en progreso cuyos trabajos y checklist de tareas de taller asociadas hayan sido marcados al 100% como completados por los mecánicos asignados.
*   **Factura y Check-out**:
    *   Los administradores pueden revisar el coste acumulado final de la mano de obra del mecánico (calculada con base en el tiempo dedicado y la tarifa horaria del taller) y los repuestos de almacén consumidos.
    *   Al hacer clic en el icono de la descarga, se genera de forma instantánea una previsualización interactiva de la factura oficial simplificada en formato PDF.
    *   Una vez que el cliente acude a recoger el vehículo y realiza el pago, el administrador hace clic en "Entregar Vehículo". Esto cambiará el estado de la cita a recogido de forma irreversible (impidiendo modificaciones posteriores en sus datos o facturas), desvinculará el vehículo del taller actual y cambiará el estado del coche a "ENTREGADO" para indicar su salida de las instalaciones.
