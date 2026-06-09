package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.AppointmentStatus;
import java.util.EnumMap;
import java.util.Map;

/**
 * Fábrica y Registro Flyweight para mapear eficientemente los enums
 * de estado a sus respectivas instancias de implementación del patrón State.
 * Mantiene instancias únicas de cada estado para optimizar el uso de memoria.
 */
public class AppointmentStateFactory {

    /**
     * Mapa interno que almacena las instancias únicas reutilizables de cada estado.
     */
    private static final Map<AppointmentStatus, AppointmentState> STATE_MAP = new EnumMap<>(AppointmentStatus.class);

    static {
        STATE_MAP.put(AppointmentStatus.PENDING, new PendingState());
        STATE_MAP.put(AppointmentStatus.CONFIRMED, new ConfirmedState());
        STATE_MAP.put(AppointmentStatus.IN_PROGRESS, new InProgressState());
        STATE_MAP.put(AppointmentStatus.DELAYED, new DelayedState());
        STATE_MAP.put(AppointmentStatus.COMPLETED, new CompletedState());
        STATE_MAP.put(AppointmentStatus.PICKED_UP, new PickedUpState());
        STATE_MAP.put(AppointmentStatus.CANCELLED, new CancelledState());
    }

    /**
     * Obtiene la instancia del estado correspondiente al enum de estado proporcionado.
     *
     * @param status Enum del estado solicitado.
     * @return Implementación concreta de {@link AppointmentState}.
     * @throws IllegalArgumentException si el estado solicitado no está registrado en la fábrica.
     */
    public static AppointmentState getState(AppointmentStatus status) {
        AppointmentState state = STATE_MAP.get(status);
        if (state == null) {
            throw new IllegalArgumentException("Estado desconocido o no soportado: " + status);
        }
        return state;
    }
}

