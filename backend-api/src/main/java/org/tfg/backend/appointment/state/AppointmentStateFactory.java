package org.tfg.backend.appointment.state;

import org.tfg.backend.appointment.AppointmentStatus;
import java.util.EnumMap;
import java.util.Map;

/**
 * Fábrica y Registro Flyweight para mapear eficientemente los enums
 * de estado a sus respectivas instancias de implementación del patrón State.
 */
public class AppointmentStateFactory {

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

    public static AppointmentState getState(AppointmentStatus status) {
        AppointmentState state = STATE_MAP.get(status);
        if (state == null) {
            throw new IllegalArgumentException("Estado desconocido o no soportado: " + status);
        }
        return state;
    }
}
