import axiosClient from '../config/axiosClient'
const notificationService = {
  // Get notifications for the logged-in user
  getAll: (params) =>
    axiosClient.get('/notifications', { params }),
  // Get unread notification count
  getUnreadCount: () =>
    axiosClient.get('/notifications/unread-count'),
  // Mark one notification as read
  markAsRead: (id) =>
    axiosClient.patch(`/notifications/${id}/read`),
  // Mark all notifications as read
  markAllAsRead: () =>
    axiosClient.patch('/notifications/read-all'),
  // Delete one notification
  delete: (id) =>
    axiosClient.delete(`/notifications/${id}`),
  // Create notification
  create: (data) =>
    axiosClient.post('/notifications', data),
}
export default notificationService