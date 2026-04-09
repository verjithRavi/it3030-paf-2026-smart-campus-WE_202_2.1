import axiosInstance from './authApi';

export const getNotifications = () =>
  axiosInstance.get('/notifications');

export const getUnreadCount = () =>
  axiosInstance.get('/notifications/unread-count');

export const markNotificationRead = (id) =>
  axiosInstance.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  axiosInstance.patch('/notifications/read-all');

export const deleteNotification = (id) =>
  axiosInstance.delete(`/notifications/${id}`);
