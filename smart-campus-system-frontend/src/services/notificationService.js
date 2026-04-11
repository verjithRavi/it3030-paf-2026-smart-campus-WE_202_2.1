import { getToken } from '../utils/token';

const API_BASE = '/api/v1';

class NotificationService {
  // Booking notifications
  static async sendBookingNotification(bookingData) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/notifications/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to send booking notification');
      }
    } catch (error) {
      console.error('Error sending booking notification:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/notifications/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get booking notifications for user
  static async getBookingNotifications(userId) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/bookings/notifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching booking notifications:', error);
      return [];
    }
  }

  // Create in-app notification
  static createNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Set color based on type
    switch (type) {
      case 'success':
        notification.classList.add('bg-green-500', 'text-white');
        break;
      case 'error':
        notification.classList.add('bg-red-500', 'text-white');
        break;
      case 'warning':
        notification.classList.add('bg-yellow-500', 'text-white');
        break;
      default:
        notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-1">${message}</div>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
      notification.classList.add('translate-x-0');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }

  // Show booking success notification
  static showBookingSuccess(bookingData) {
    const message = `Booking confirmed! ${bookingData.resourceName} booked for ${bookingData.purpose}`;
    this.createNotification(message, 'success');
  }

  // Show booking error notification
  static showBookingError(error) {
    const message = `Booking failed: ${error}`;
    this.createNotification(message, 'error');
  }

  // Show booking approval notification
  static showBookingApproval(bookingData) {
    const message = `Booking approved! Your booking for ${bookingData.resourceName} has been approved.`;
    this.createNotification(message, 'success');
  }

  // Show booking rejection notification
  static showBookingRejection(bookingData) {
    const message = `Booking rejected. Your booking for ${bookingData.resourceName} was not approved.`;
    this.createNotification(message, 'warning');
  }
}

export default NotificationService;
