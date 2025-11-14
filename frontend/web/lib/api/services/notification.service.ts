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
  private serviceAvailable: boolean = true;

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
    if (!this.serviceAvailable) return [];
    
    const userId = this.getUserId();
    try {
      // GET /api/notifications/user/{userId}
      const res = await apiRequest<Notification[]>(
        `/api/notifications/user/${encodeURIComponent(userId)}`
      );
      return res || [];
    } catch (err: any) {
      // If 404, service not implemented - mark as unavailable
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
        console.info('Notifications service not available - using empty state');
      } else {
        console.warn('Notifications service error:', err?.message);
      }
      return [];
    }
  }

  async getUnread(): Promise<Notification[]> {
    if (!this.serviceAvailable) return [];
    
    const userId = this.getUserId();
    try {
      // GET /api/notifications/user/{userId}/unread
      const res = await apiRequest<Notification[]>(
        `/api/notifications/user/${encodeURIComponent(userId)}/unread`
      );
      return res || [];
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    if (!this.serviceAvailable) return 0;
    
    const userId = this.getUserId();
    try {
      // GET /api/notifications/user/{userId}/count/unread
      const res = await apiRequest<any>(
        `/api/notifications/user/${encodeURIComponent(userId)}/count/unread`
      );
      if (typeof res === 'number') return res;
      if (res && typeof res.count === 'number') return res.count;
      return 0;
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (!this.serviceAvailable) return;
    
    const userId = this.getUserId();
    try {
      // PATCH /api/notifications/{id}/read?userId={userId}
      await apiRequest(
        `/api/notifications/${encodeURIComponent(notificationId)}/read?userId=${encodeURIComponent(
          userId
        )}`,
        { method: 'PATCH', body: JSON.stringify({}) }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
      // Don't throw - fail silently
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.serviceAvailable) return;
    
    const userId = this.getUserId();
    try {
      // PATCH /api/notifications/user/{userId}/read-all
      await apiRequest(
        `/api/notifications/user/${encodeURIComponent(userId)}/read-all`,
        { method: 'PATCH', body: JSON.stringify({}) }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
      // Don't throw - fail silently
    }
  }

  async delete(notificationId: string): Promise<void> {
    if (!this.serviceAvailable) return;
    
    const userId = this.getUserId();
    try {
      // DELETE /api/notifications/{id}?userId={userId}
      await apiRequest(
        `/api/notifications/${encodeURIComponent(notificationId)}?userId=${encodeURIComponent(
          userId
        )}`,
        { method: 'DELETE' }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
      // Don't throw - fail silently
    }
  }

  async deleteAll(): Promise<void> {
    if (!this.serviceAvailable) return;
    
    const userId = this.getUserId();
    try {
      // DELETE /api/notifications/user/{userId}
      await apiRequest(
        `/api/notifications/user/${encodeURIComponent(userId)}`,
        { method: 'DELETE' }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
      // Don't throw - fail silently
    }
  }

  /* ------------------------------ Settings ------------------------------ */

  async getSettings(): Promise<NotificationSettings> {
    if (!this.serviceAvailable) return this.getDefaultSettings();
    
    const userId = this.getUserId();
    try {
      // GET /api/notifications/settings/{userId}
      const res = await apiRequest<NotificationSettings>(
        `/api/notifications/settings/${encodeURIComponent(userId)}`
      );
      return res || this.getDefaultSettings();
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
        console.info('Notification settings service not available - using defaults');
      }
      return this.getDefaultSettings();
    }
  }

  async updateSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    if (!this.serviceAvailable) return this.getDefaultSettings();
    
    const userId = this.getUserId();
    try {
      // PUT /api/notifications/settings/{userId}
      const res = await apiRequest<NotificationSettings>(
        `/api/notifications/settings/${encodeURIComponent(userId)}`,
        { method: 'PUT', body: JSON.stringify(settings) }
      );
      return res;
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
      // Return merged default settings with attempted changes
      return { ...this.getDefaultSettings(), ...settings };
    }
  }

  async resetSettings(): Promise<NotificationSettings> {
    if (!this.serviceAvailable) return this.getDefaultSettings();
    
    const userId = this.getUserId();
    try {
      // POST /api/notifications/settings/{userId}/reset
      const res = await apiRequest<NotificationSettings>(
        `/api/notifications/settings/${encodeURIComponent(userId)}/reset`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      return res || this.getDefaultSettings();
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        this.serviceAvailable = false;
      }
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

  // Method to check if service is available
  isServiceAvailable(): boolean {
    return this.serviceAvailable;
  }

  // Method to manually reset service availability (useful for testing)
  resetServiceAvailability(): void {
    this.serviceAvailable = true;
  }
}

export const notificationService = new NotificationService();
export default notificationService;