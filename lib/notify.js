import { NotifyClient } from "notifications-node-client";

export async function getEmailAlerts(title) {
  const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY);
  const response = await notifyClient.getNotifications(
    "email",
    "delivered",
    null,
    null,
  );
  const notifications = response.data.notifications;
  return notifications.filter((notification) => {
    return (
      notification.email_address === process.env.EMAIL_ALERT_EMAIL &&
      notification.subject === `Update from GOV.UK for: ${title}`
    );
  });
}
