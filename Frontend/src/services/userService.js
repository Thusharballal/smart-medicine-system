import axiosClient from '../config/axiosClient'
const userService = {
  getMe: () => axiosClient.get('/users/me'),
  updateMe: (data) =>
    axiosClient.put('/users/me', data),
  deleteMe: () =>
    axiosClient.delete('/users/me'),
  // Admin operations
  getAllUsers: (params) =>
    axiosClient.get('/users/admin/all', { params }),
  getUserById: (id) =>
    axiosClient.get(`/users/admin/${id}`),
  updateUser: (id, data) =>
    axiosClient.put(`/users/admin/${id}`, data),
  deactivateUser: (id) =>
    axiosClient.patch(`/users/admin/${id}/deactivate`),
  deleteUser: (id) =>
    axiosClient.delete(`/users/admin/${id}`),
}
export default userService