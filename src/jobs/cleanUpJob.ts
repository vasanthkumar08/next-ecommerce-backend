import { releaseExpiredReservations } from "../modules/order/order.service.js";

const cleanupIntervalMs = 60 * 1000;

const runExpiredReservationCleanup = async () => {
  try {
    const result = await releaseExpiredReservations();

    if (result.released > 0) {
      console.info("expired_reservations_released", result);
    }
  } catch (error) {
    console.error("expired_reservation_cleanup_failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

void runExpiredReservationCleanup();

setInterval(() => {
  void runExpiredReservationCleanup();
}, cleanupIntervalMs);
