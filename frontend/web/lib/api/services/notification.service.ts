// lib/api/services/notification.service.ts
import { apiRequest, getToken } from '@/lib/api';

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
      // GET /api/notifications/user/{userId}
      const res = await apiRequest<Notification[]>(
        `/api/notifications/user/${encodeURIComponent(userId)}`
      );
      return res || [];
    } catch (err) {
      console.warn('Notifications service not available - using empty state');
      return [];
    }
  }

  async getUnread(): Promise<Notification[]> {
    const userId = this.getUserId();
    try {
      // GET /api/notifications/user/{userId}/unread
      const res = await apiRequest<Notification[]>(
        `/api/notifications/user/${encodeURIComponent(userId)}/unread`
      );
      return res || [];
    } catch (err) {
      console.warn('Notifications service not available - using empty state');
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    const userId = this.getUserId();
    try {
      // GET /api/notifications/user/{userId}/count/unread
      const res = await apiRequest<any>(
        `/api/notifications/user/${encodeURIComponent(userId)}/count/unread`
      );
      if (typeof res === 'number') return res;
      if (res && typeof res.count === 'number') return res.count;
      return 0;
    } catch {
      console.warn('Notifications service not available - count is 0');
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const userId = this.getUserId();
    try {
      // PATCH /api/notifications/{id}/read?userId={userId}
      await apiRequest(
        `/api/notifications/${encodeURIComponent(notificationId)}/read?userId=${encodeURIComponent(
          userId
        )}`,
        { method: 'PATCH', body: JSON.stringify({}) }
      );
    } catch (err) {
      console.warn('Failed to mark notification as read - service not available');
      throw err;
    }
  }

  async markAllAsRead(): Promise<void> {
    const userId = this.getUserId();
    try {
      // PATCH /api/notifications/user/{userId}/read-all
      await apiRequest(
        `/api/notifications/user/${encodeURIComponent(userId)}/read-all`,
        { method: 'PATCH', body: JSON.stringify({}) }
      );
    } catch (err) {
      console.warn('Failed to mark all notifications as read - service not available');
      throw err;
    }
  }

  async delete(notificationId: string): Promise<void> {
    const userId = this.getUserId();
    try {
      // DELETE /api/notifications/{id}?userId={userId}
      await apiRequest(
        `/api/notifications/${encodeURIComponent(notificationId)}?userId=${encodeURIComponent(
          userId
        )}`,
        { method: 'DELETE' }
      );
    } catch (err) {
      console.warn('Failed to delete notification - service not available');
      throw err;
    }
  }

  async deleteAll(): Promise<void> {
    const userId = this.getUserId();
    try {
      // DELETE /api/notifications/user/{userId}
      await apiRequest(
        `/api/notifications/user/${encodeURIComponent(userId)}`,
        { method: 'DELETE' }
      );
    } catch (err) {
      console.warn('Failed to delete all notifications - service not available');
      throw err;
    }
  }

  /* ------------------------------ Settings ------------------------------ */

  async getSettings(): Promise<NotificationSettings> {
    const userId = this.getUserId();
    try {
      // GET /api/notifications/settings/{userId}
      const res = await apiRequest<NotificationSettings>(
        `/api/notifications/settings/${encodeURIComponent(userId)}`
      );
      return res || this.getDefaultSettings();
    } catch {
      console.warn('Notification settings service not available - using defaults');
      return this.getDefaultSettings();
    }
  }

  async updateSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const userId = this.getUserId();
    try {
      // PUT /api/notifications/settings/{userId}
      const res = await apiRequest<NotificationSettings>(
        `/api/notifications/settings/${encodeURIComponent(userId)}`,
        { method: 'PUT', body: JSON.stringify(settings) }
      );
      return res;
    } catch (err) {
      console.warn('Failed to update notification settings - service not available');
      throw err;
    }
  }

  async resetSettings(): Promise<NotificationSettings> {
    const userId = this.getUserId();
    try {
      // POST /api/notifications/settings/{userId}/reset
      const res = await apiRequest<NotificationSettings>(
        `/api/notifications/settings/${encodeURIComponent(userId)}/reset`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      return res || this.getDefaultSettings();
    } catch {
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
