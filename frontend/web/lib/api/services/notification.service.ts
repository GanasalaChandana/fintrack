// lib/api/services/notification.service.ts
import api, { getToken } from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationSettings {
  id?: string;
  userId?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  transactionAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

class NotificationService {
  /** Resolve the active user id. */
  private getUserId(): string {
    if (typeof window === 'undefined') return 'dev-user-123';
    
    const fromStorage =
      localStorage.getItem('userId') ||
      localStorage.getItem('currentUserId') ||
      '';
    if (fromStorage) return fromStorage;

    return process.env.NODE_ENV === 'development' ? 'dev-user-123' : '';
  }

  /* ---------------------------- Notifications ---------------------------- */

  async getAll(): Promise<Notification[]> {
    const userId = this.getUserId();
    try {
      // Matches: GET /api/notifications/user/{userId}
      const res = await api.get(`/notifications/user/${encodeURIComponent(userId)}`);
      return res || [];
    } catch (err) {
      console.warn('Notifications service not available - using empty state');
      return [];
    }
  }

  async getUnread(): Promise<Notification[]> {
    const userId = this.getUserId();
    try {
      // Matches: GET /api/notifications/user/{userId}/unread
      const res = await api.get(`/notifications/user/${encodeURIComponent(userId)}/unread`);
      return res || [];
    } catch (err) {
      console.warn('Notifications service not available - using empty state');
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    const userId = this.getUserId();
    try {
      // Matches: GET /api/notifications/user/{userId}/count/unread
      const res = await api.get(`/notifications/user/${encodeURIComponent(userId)}/count/unread`);
      if (typeof res === 'number') return res;
      if (res && typeof res.count === 'number') return res.count;
      return 0;
    } catch (err) {
      console.warn('Notifications service not available - count is 0');
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const userId = this.getUserId();
    try {
      // Matches: PATCH /api/notifications/{id}/read?userId={userId}
      await api.patch(
        `/notifications/${encodeURIComponent(notificationId)}/read?userId=${encodeURIComponent(userId)}`,
        {}
      );
    } catch (err) {
      console.warn('Failed to mark notification as read - service not available');
      throw err;
    }
  }

  async markAllAsRead(): Promise<void> {
    const userId = this.getUserId();
    try {
      // Matches: PATCH /api/notifications/user/{userId}/read-all
      await api.patch(`/notifications/user/${encodeURIComponent(userId)}/read-all`, {});
    } catch (err) {
      console.warn('Failed to mark all notifications as read - service not available');
      throw err;
    }
  }

  async delete(notificationId: string): Promise<void> {
    const userId = this.getUserId();
    try {
      // Matches: DELETE /api/notifications/{id}?userId={userId}
      await api.delete(`/notifications/${encodeURIComponent(notificationId)}?userId=${encodeURIComponent(userId)}`);
    } catch (err) {
      console.warn('Failed to delete notification - service not available');
      throw err;
    }
  }

  async deleteAll(): Promise<void> {
    const userId = this.getUserId();
    try {
      // Matches: DELETE /api/notifications/user/{userId}
      await api.delete(`/notifications/user/${encodeURIComponent(userId)}`);
    } catch (err) {
      console.warn('Failed to delete all notifications - service not available');
      throw err;
    }
  }

  /* ------------------------------ Settings ------------------------------ */

  async getSettings(): Promise<NotificationSettings> {
    const userId = this.getUserId();
    try {
      // Matches: GET /api/notifications/settings/{userId}
      const res = await api.get(`/notifications/settings/${encodeURIComponent(userId)}`);
      return (res as NotificationSettings) || this.getDefaultSettings();
    } catch (err) {
      console.warn('Notification settings service not available - using defaults');
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const userId = this.getUserId();
    try {
      // Matches: PUT /api/notifications/settings/{userId}
      const res = await api.put(
        `/notifications/settings/${encodeURIComponent(userId)}`,
        settings
      );
      return res as NotificationSettings;
    } catch (err) {
      console.warn('Failed to update notification settings - service not available');
      throw err;
    }
  }

  async resetSettings(): Promise<NotificationSettings> {
    const userId = this.getUserId();
    try {
      // Matches: POST /api/notifications/settings/{userId}/reset
      const res = await api.post(`/notifications/settings/${encodeURIComponent(userId)}/reset`, {});
      return (res as NotificationSettings) || this.getDefaultSettings();
    } catch (err) {
      console.warn('Failed to reset notification settings - service not available');
      return this.getDefaultSettings();
    }
  }

  /* ------------------------------ Helpers ------------------------------- */

  private getDefaultSettings(): NotificationSettings {
    return {
      emailNotifications: true,
      pushNotifications: false,
      budgetAlerts: true,
      transactionAlerts: true,
      weeklyReports: false,
      monthlyReports: false,
    };
  }

  isAuthenticated(): boolean {
    return !!getToken();
  }
}

export const notificationService = new NotificationService();
export default notificationService;