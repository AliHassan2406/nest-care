import './env.js';

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:4004';

export async function sendNotification(notification) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/internal/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'home-services-local' },
      body: JSON.stringify(notification),
      signal: AbortSignal.timeout(1800),
    });
  } catch (error) {
    // Notification delivery is best-effort: an outage must not fail the main request.
    console.warn('[notifications] Notification service unavailable:', error.message);
  }
}
