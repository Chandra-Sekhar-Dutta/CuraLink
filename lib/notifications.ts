export type Notification = {
  id: string;
  type: 'forum_reply' | 'collaboration_request' | 'trial_update' | 'message' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
};

const NOTIFICATIONS_KEY = 'userNotifications';

// Load notifications for current user
export function loadNotifications(userId: string): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${NOTIFICATIONS_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
    }
  } catch {}
  return [];
}

// Save notifications for current user
export function saveNotifications(userId: string, notifications: Notification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
  } catch {}
}

// Add a new notification
export function addNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
) {
  const notifications = loadNotifications(userId);
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date(),
    read: false,
  };
  notifications.unshift(newNotification);
  saveNotifications(userId, notifications);
}

// Mark notification as read
export function markAsRead(userId: string, notificationId: string) {
  const notifications = loadNotifications(userId);
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(userId, updated);
}

// Mark all notifications as read
export function markAllAsRead(userId: string) {
  const notifications = loadNotifications(userId);
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(userId, updated);
}

// Get unread count
export function getUnreadCount(userId: string): number {
  const notifications = loadNotifications(userId);
  return notifications.filter(n => !n.read).length;
}

// Delete a notification
export function deleteNotification(userId: string, notificationId: string) {
  const notifications = loadNotifications(userId);
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(userId, filtered);
}

// Clear all notifications
export function clearAllNotifications(userId: string) {
  saveNotifications(userId, []);
}
