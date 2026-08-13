/**
 * Component: AdminUsers
 *
 * Description: User management page for the admin portal.
 * Responsibilities: View, edit, deactivate, delete users with search/filter/sort/pagination.
 * Backend readiness: TODO: GET /api/v1/admin/users
 */

import { HiOutlineEye, HiOutlinePencil, HiOutlineNoSymbol, HiOutlineTrash } from 'react-icons/hi2'
import Badge     from '../../components/ui/Badge'
import Avatar    from '../../components/ui/Avatar'
import AdminTable from './components/AdminTable'
import { useEffect, useState } from 'react'
import userService from '../../services/userService'
const ROLE_VARIANT = {
  user: 'neutral',
  pharmacy_owner: 'secondary',
  admin: 'danger',
}
const STATUS_VARIANT = {
  active: 'success',
  suspended: 'danger',
  deleted: 'neutral',
}
const getColumns = (handleViewUser, handleEditUser) => [
  {
    key: 'name', label: 'User',
    render: row => (
      <div className="flex items-center gap-2">
        <Avatar name={row.name} size="sm" />
        <div>
          <p className="text-xs font-semibold text-slate-900">{row.name}</p>
          <p className="text-[10px] text-slate-400">{row.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'role',   label: 'Role',   render: row => <Badge variant={ROLE_VARIANT[row.role]   ?? 'neutral'} size="sm">{row.role}</Badge> },
  { key: 'status', label: 'Status', render: row => <Badge variant={STATUS_VARIANT[row.status] ?? 'neutral'} dot size="sm">{row.status}</Badge> },
  { key: 'joined', label: 'Joined', hide: 'md', render: row => <span className="text-xs text-slate-500">{row.joined}</span> },
  {
    key: '_actions', label: 'Actions',
    render: row => (
      <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`View ${row.name}`}
        onClick={() => handleViewUser(row)}
        className="p-1.5 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
      >
        <HiOutlineEye size={15} />
        </button>
        <button
          type="button"
          aria-label={`Edit ${row.name}`}
          onClick={() => handleEditUser(row)}
          className="p-1.5 rounded text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary-500"
        >
          <HiOutlinePencil size={15} />
        </button>
        <button type="button" aria-label={`Deactivate ${row.name}`} className="p-1.5 rounded text-slate-400 hover:text-warning-600 hover:bg-warning-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-warning-400">
          <HiOutlineNoSymbol size={14} aria-hidden="true" />
        </button>
        <button type="button" aria-label={`Delete ${row.name}`} className="p-1.5 rounded text-slate-400 hover:text-danger-500 hover:bg-danger-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger-400">
          <HiOutlineTrash size={14} aria-hidden="true" />
        </button>
      </div>
    ),
  },
]
function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [viewError, setViewError] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [isEditSaving, setIsEditSaving] = useState(false)
  const [editError, setEditError] = useState(null)
useEffect(() => {
  async function fetchUsers() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await userService.getAllUsers()
      console.log('ADMIN USERS API RESPONSE:', response)
      console.log('ADMIN USERS DATA:', response.data)
      const formattedUsers = Array.isArray(response.data)
        ? response.data.map((user) => ({
            ...user,
            id: user.id,
            name: user.full_name || user.email || 'Unknown User',
            joined: user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : '—',
            role: user.role
              ? String(user.role).toLowerCase()
              : 'user',
            status: user.status
              ? String(user.status).toLowerCase()
              : 'inactive',
          }))
        : []
      console.log('FORMATTED USERS:', formattedUsers)
      setUsers(formattedUsers)
    } catch (err) {
      console.error('FAILED TO LOAD ADMIN USERS:', err)
      console.error('STATUS:', err.response?.status)
      console.error('RESPONSE:', err.response?.data)
      setError(
        err.response?.data?.detail ||
        'Failed to load users.'
      )
    } finally {
      setIsLoading(false)
    }
  }
  fetchUsers()
}, [])
  async function handleViewUser(user) {
    console.log('VIEW BUTTON CLICKED', user)
  try {
    setIsViewLoading(true)
    setViewError(null)
    const response = await userService.getUserById(user.id)
    setSelectedUser(response.data)
  } catch (err) {
    console.error('Failed to load user:', err)
    setViewError('Failed to load user details.')
  } finally {
    setIsViewLoading(false)
  }
}
async function handleEditUser(user) {
  console.log('EDIT BUTTON CLICKED', user)
  try {
    setEditError(null)
    const response = await userService.getUserById(user.id)
    setEditingUser(response.data)
  } catch (err) {
    console.error('Failed to load user for editing:', err)
    setEditError('Failed to load user details.')
  }
}
async function handleSaveUser() {
  if (!editingUser) return
  try {
    setIsEditSaving(true)
    setEditError(null)
    const updateData = {
      full_name: editingUser.full_name,
      phone_number: editingUser.phone_number,
      role: editingUser.role,
      status: editingUser.status,
    }
    await userService.updateUser(
      editingUser.id,
      updateData
    )
    // Refresh users from backend
    const response = await userService.getAllUsers()
    const formattedUsers = response.data.map((user) => ({
      ...user,
      name: user.full_name,
      joined: user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : '—',
      role: user.role?.toLowerCase() ?? 'user',
      status: user.status?.toLowerCase() ?? 'inactive',
    }))
    setUsers(formattedUsers)
    setEditingUser(null)
  } catch (err) {
    console.error('Failed to update user:', err)
    setEditError(
      err.response?.data?.detail ||
      'Failed to update user.'
    )
  } finally {
    setIsEditSaving(false)
  }
}
const columns = getColumns(
  handleViewUser,
  handleEditUser
)
  return (
    <article className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          User Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage registered users across all roles.
        </p>
      </div>
      {isLoading && (
        <div className="p-6 text-center text-slate-500">
          Loading users...
        </div>
      )}
      {error && (
        <div className="p-6 text-center text-red-600">
          {error}
        </div>
      )}
      {!isLoading && !error && (
        <AdminTable
          columns={columns}
          data={users}
          searchPlaceholder="Search users by name, email or role…"
          ariaLabel="Users management table"
        />
      )}
      {selectedUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
      
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            User Details
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete user information
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="text-slate-400 hover:text-slate-700 text-xl"
          aria-label="Close user details"
        >
          ×
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-slate-400">Name</p>
          <p className="text-sm font-semibold text-slate-800">
            {selectedUser.full_name}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Email</p>
          <p className="text-sm text-slate-800">
            {selectedUser.email}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Phone</p>
          <p className="text-sm text-slate-800">
            {selectedUser.phone_number}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400">Role</p>
            <p className="text-sm font-semibold text-slate-800">
              {selectedUser.role}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className="text-sm font-semibold text-slate-800">
              {selectedUser.status}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400">Email Verified</p>
          <p className="text-sm text-slate-800">
            {selectedUser.is_email_verified ? 'Yes' : 'No'}
          </p>
        </div>

      </div>
      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
{editingUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Edit User
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Update user account details
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingUser(null)}
          className="text-slate-400 hover:text-slate-700 text-xl"
          aria-label="Close edit user"
        >
          ×
        </button>
      </div>
      {/* Form */}
      <div className="p-6 space-y-4">

        {editError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {editError}
          </div>
        )}
        {/* Full Name */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Full Name
          </label>
          <input
            type="text"
            value={editingUser.full_name || ''}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                full_name: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Email
          </label>
          <input
            type="email"
            value={editingUser.email || ''}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          />
        </div>
        {/* Phone */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Phone Number
          </label>
          <input
            type="text"
            value={editingUser.phone_number || ''}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                phone_number: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {/* Role */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Role
          </label>
          <select
            value={editingUser.role || 'USER'}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                role: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="USER">USER</option>
            <option value="PHARMACY_OWNER">PHARMACY_OWNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Status
          </label>
          <select
            value={editingUser.status || 'ACTIVE'}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                status: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="DELETED">DELETED</option>
          </select>
        </div>

      </div>
      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={() => setEditingUser(null)}
          disabled={isEditSaving}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveUser}
          disabled={isEditSaving}
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isEditSaving ? 'Saving...' : 'Save Changes'}
        </button>

      </div>

    </div>
  </div>
)}
    </article>
  )
}
export default AdminUsers
