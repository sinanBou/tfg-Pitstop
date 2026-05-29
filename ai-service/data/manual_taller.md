# Manual Operativo del Taller (Pitstop Admin & Staff)

Este manual técnico está dirigido a mecánicos (`WORKSHOP_STAFF`), administradores (`WORKSHOP_MANAGER`) y propietarios (`WORKSHOP_OWNER`) para gestionar eficientemente las operaciones del taller mecánico.

---

## 📅 1. Panel de Planificación y Línea de Tiempo
El panel de **Planificación** es el corazón operativo del taller:
- **Columnas de Mecánicos**: Cada columna representa la agenda diaria de un mecánico activo. Puedes navegar por días usando el selector de fecha superior.
- **Citas Pendientes**: Las citas solicitadas por clientes aparecen en el lateral como "Pendientes".
- **Asignación por Arrastre (Drag and Drop)**: Arrastra una cita pendiente directamente sobre la columna de un mecánico a la hora deseada. Esto cambiará su estado a **CONFIRMADA** y le asignará dicho profesional.
- **Re-programación**: Si arrastras una cita confirmada a otro bloque horario o a otro mecánico, el sistema actualizará dinámicamente el horario en la base de datos de forma transaccional.

---

## 👤 2. Configuración: Incluir al Dueño en la Planificación
Para talleres pequeños o familiares, el propietario también realiza labores de mecánica:
- **Activar la Opción**: Ve a la pestaña **Ajustes del Taller** y activa la opción "Añadir al dueño a la planificación".
- **Efecto en Capacidad**: 
  - Al activarse, la capacidad operativa real del taller aumenta en **1 slot extra por hora** (`totalMechanics = staffCount + 1`).
  - En la línea de tiempo aparecerá una columna dedicada para el propietario (`WORKSHOP_OWNER`) permitiendo arrastrar citas a su agenda.
  - El sistema de reservas del cliente habilitará un hueco más de reserva por cada slot de ese día.
- **Baja del Dueño**: Si desactivas la opción pero ya hay citas confirmadas asignadas al dueño, **las citas previas no se eliminan ni modifican** para preservar el historial del cliente, pero no se podrán registrar nuevas reservas en su slot.

---

## 🚨 3. Paneles de Alertas de Stock y Retrasos
Ubicados verticalmente uno al lado del otro en la pestaña de **Avisos**, estos paneles componetizados estandarizan la gestión de incidencias:
### A. Aviso de Stock (Inventario Bajo Mínimos)
- Muestra una lista de repuestos físicos de tu almacén cuyo stock actual es inferior al umbral de aviso preconfigurado (`avisoThreshold`).
- Permite identificar de un vistazo las piezas críticas a reponer.

### B. Gestión de Citas Retrasadas (`DELAYED`)
- **Marcar como Retrasada**: En el bloque de cita (Timeline), en la pestaña de Citas, o en las Agendas individuales, puedes hacer clic en el botón de **Incidencia por Retraso**. Esto cambia el estado de la cita a `DELAYED` y muestra un indicador rojo parpadeante.
- **Notificación en el Dashboard**: Aparece de inmediato una alerta en el panel de incidencias.
- **Desbloqueo de Horario**: Al hacer clic en el botón **Ir a Planificación** del aviso:
  1. La aplicación te redirige a la pantalla de planificación diaria.
  2. **Se elimina el bloqueo de asignación horaria estricta** para esa cita concreta en `localStorage` (citas desbloqueadas), permitiéndote reubicarla libremente a cualquier otra hora o profesional sin restricciones de solapamiento.
  3. El aviso en el panel de notificaciones desaparece.

---

## 🔧 4. Gestión de Tareas y Repuestos (Ficha de Cita)
Al hacer clic en "Gestionar" en cualquier cita activa (siempre y cuando el vehículo haya sido recepcionado en el check-in de kilómetros):
- **Añadir Repuestos**: Busca piezas en el catálogo del taller. Al asignarlas a la cita, se descuentan automáticamente del inventario físico.
- **Estrategias de Precios (Pricing Strategy)**:
  - `Standard`: Aplica el PVP configurado.
  - `Discount`: Permite aplicar un porcentaje de descuento personalizado directamente al repuesto.
- **Secciones Permitidas (`allowedSections`)**: Desde el panel de equipo, los gerentes pueden asignar secciones específicas (ej. "Electricidad, Frenos") a cada mecánico. El mecánico solo podrá interactuar con las tareas del catálogo asociadas a sus secciones permitidas.

---

## 🔒 5. Recepción del Vehículo (Gatekeeper Pattern)
Por motivos de procedimiento y seguridad industrial:
- Ninguna cita puede ser iniciada (`IN_PROGRESS`), ni se le pueden asociar repuestos u órdenes de trabajo, hasta que el vehículo haya sido **físicamente recibido** en el taller.
- El botón de gestionar aparecerá bloqueado con un candado ámbar si el vehículo no se ha recepcionado.
- Para recepcionarlo, haz clic en "Recepcionar Coche", introduce el kilometraje de entrada y las notas del estado inicial. Esto desbloqueará automáticamente todas las herramientas de gestión de la cita.
