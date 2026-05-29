# Manual de Usuario - Área del Cliente (Pitstop)

Bienvenido a **Pitstop**, la aplicación de gestión de citas y mantenimiento de vehículos. Este manual detalla todo lo que puedes hacer desde tu Panel de Cliente.

---

## 🚗 1. Gestión de mis Vehículos
Desde la pestaña **Vehículos** puedes gestionar toda tu flota personal:
- **Registrar un Vehículo**: Haz clic en "Registrar Vehículo". Introduce la marca (puedes seleccionarla del catálogo dinámico), modelo, matrícula (debe ser única), año de matriculación, número de chasis (VIN) y color.
- **Ver Detalles**: Cada vehículo muestra una tarjeta elegante con su ficha técnica y un historial completo de sus visitas anteriores al taller.
- **Previsualizar Fotos**: Si hay fotos adjuntas al vehículo o a sus citas, podrás verlas haciendo clic sobre ellas.

---

## 📅 2. Solicitar Citas (Agendar Cita)
El proceso para agendar una cita es 100% automático y en tiempo real:
1. Haz clic en el botón flotante o en la opción **Pedir Cita**.
2. **Paso 1: Seleccionar Cliente y Vehículo**: Selecciona el coche registrado para el que deseas la reparación.
3. **Paso 2: Buscar Taller**: Escribe el nombre del taller (ej. *Taller PitStop*, *Motosport*) para buscarlo.
4. **Paso 3: Fecha y Hora**: Selecciona un día laborable del calendario. La aplicación consultará los *slots* disponibles de 1 hora del taller (ej. 09:00, 10:00, 16:00, etc.). Si un slot no tiene mecánicos libres, aparecerá deshabilitado.
5. **Paso 4: Detalles del Servicio**: Indica el tipo de servicio (Mantenimiento general, Frenos, Transmisión, Electricidad, Neumáticos, Motor, etc.) y una descripción breve del fallo.
6. **Confirmación**: Al enviar, la cita se guardará como **PENDIENTE** (`PENDING`) y aparecerá en tu listado de citas solicitadas.

---

## 📈 3. Seguimiento e Historial de Citas
En la pestaña **Citas** y **Historial** puedes ver en vivo el estado de tu coche en el taller:
- **PENDIENTE**: Has solicitado la cita, pero el taller aún no ha asignado un mecánico o confirmado el hueco.
- **CONFIRMADA**: El taller aceptó tu cita y tiene asignado un mecánico para ti.
- **EN PROCESO**: El mecánico está trabajando activamente en tu vehículo (verás el estado en vivo).
- **RETRASADA** (`DELAYED`): Si surge una incidencia y se supera el tiempo estimado de entrega, aparecerá un aviso de advertencia parpadeante en rojo.
- **COMPLETADA**: El trabajo está listo. Puedes acudir al taller a retirar tu vehículo.
- **RECOGIDO**: Has retirado el vehículo y la cita se archiva con su respectiva orden de facturación.

---

## 🧾 4. Facturación, Gastos y Estadísticas
En la pestaña **Informes y Facturas** tienes un control financiero total:
- **KPIs Mensuales**: Revisa el coste total que has invertido en reparaciones en el mes seleccionado o de manera acumulada anual.
- **Gráficas de Gastos**: Gráfica de barras que muestra qué vehículos consumen más presupuesto y el desglose de costes en piezas vs mano de obra.
- **Descargar e Imprimir Facturas**: En el historial de citas recogidas, haz clic en el icono de la impresora para generar, guardar o descargar un reporte en PDF elegante y limpio de tu última factura o de cualquier factura histórica, listo para guardar o imprimir localmente en tu dispositivo.


---

## 👤 5. Gestión del Perfil
Haz clic en el avatar de la esquina superior derecha para abrir **Mi Perfil**:
- Puedes actualizar tu nombre, apellidos, dirección y teléfono.
- Sube una foto de avatar personalizada. La foto se almacena de forma segura en la nube (AWS S3) y se actualizará automáticamente en tu cabecera.
