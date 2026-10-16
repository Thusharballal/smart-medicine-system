import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineNoSymbol,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import AdminTable from './components/AdminTable'
import userService from '../../services/userService'
/* =========================================================
   ROLE CONFIGURATION
========================================================= */
const ROLE_VARIANT = {
  user: 'neutral',
  pharmacy_owner: 'secondary',
  admin: 'danger',
}

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_VARIANT = {
  active: 'success',
  suspended: 'danger',
  deleted: 'neutral',
}

/* =========================================================
   FORMAT USER
========================================================= */

function formatUser(user) {
  return {
    ...user,

    /*
     * Support both possible backend ID formats.
     * This prevents View/Edit/Deactivate/Delete from
     * failing if MongoDB returns _id instead of id.
     */
    id: user.id || user._id,

    name:
      user.full_name ||
      user.email ||
      'Unknown User',

    joined: user.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : '—',

    role: user.role
      ? String(user.role).toLowerCase()
      : 'user',

    status: user.status
      ? String(user.status).toLowerCase()
      : 'active',
  }
}

/* =========================================================
   TABLE COLUMNS
========================================================= */

const getColumns = (
  handleViewUser,
  handleEditUser,
  handleDeactivateUser,
  handleDeleteUser,
  actionLoading,
) => [
  {
    key: 'name',
    label: 'User',

    render: row => (
      <div className="flex items-center gap-2">
        <Avatar
          name={row.name}
          size="sm"
        />

        <div>
          <p className="text-xs font-semibold text-slate-900">
            {row.name}
          </p>

          <p className="text-[10px] text-slate-400">
            {row.email}
          </p>
        </div>
      </div>
    ),
  },

  {
    key: 'role',
    label: 'Role',

    render: row => (
      <Badge
        variant={
          ROLE_VARIANT[row.role] ||
          'neutral'
        }
        size="sm"
      >
        {row.role}
      </Badge>
    ),
  },

  {
    key: 'status',
    label: 'Status',

    render: row => (
      <Badge
        variant={
          STATUS_VARIANT[row.status] ||
          'neutral'
        }
        dot
        size="sm"
      >
        {row.status}
      </Badge>
    ),
  },

  {
    key: 'joined',
    label: 'Joined',
    hide: 'md',

    render: row => (
      <span className="text-xs text-slate-500">
        {row.joined}
      </span>
    ),
  },

  {
    key: '_actions',
    label: 'Actions',

    render: row => {
      const isThisUserLoading =
        actionLoading?.userId === row.id

      const isDeactivateLoading =
        isThisUserLoading &&
        actionLoading?.action === 'deactivate'

      const isDeleteLoading =
        isThisUserLoading &&
        actionLoading?.action === 'delete'

      return (
        <div className="flex items-center gap-1">

          {/* =================================================
              VIEW
          ================================================= */}

          <button
            type="button"
            aria-label={`View ${row.name}`}
            onClick={() =>
              handleViewUser(row)
            }
            disabled={isThisUserLoading}
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineEye size={15} />
          </button>

          {/* =================================================
              EDIT
          ================================================= */}

          <button
            type="button"
            aria-label={`Edit ${row.name}`}
            onClick={() =>
              handleEditUser(row)
            }
            disabled={isThisUserLoading}
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-secondary-50 hover:text-secondary-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlinePencil size={15} />
          </button>

          {/* =================================================
              DEACTIVATE
          ================================================= */}

          <button
            type="button"
            aria-label={`Deactivate ${row.name}`}
            onClick={() =>
              handleDeactivateUser(row)
            }
            disabled={
              isThisUserLoading ||
              row.status === 'suspended' ||
              row.status === 'deleted'
            }
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-warning-50 hover:text-warning-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-warning-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isDeactivateLoading ? (
              <span className="text-[10px] font-semibold">
                ...
              </span>
            ) : (
              <HiOutlineNoSymbol
                size={14}
                aria-hidden="true"
              />
            )}
          </button>

          {/* =================================================
              DELETE
          ================================================= */}

          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            onClick={() =>
              handleDeleteUser(row)
            }
            disabled={
              isThisUserLoading ||
              row.status === 'deleted'
            }
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-danger-50 hover:text-danger-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isDeleteLoading ? (
              <span className="text-[10px] font-semibold">
                ...
              </span>
            ) : (
              <HiOutlineTrash
                size={14}
                aria-hidden="true"
              />
            )}
          </button>

        </div>
      )
    },
  },
]

/* =========================================================
   ADMIN USERS
========================================================= */

function AdminUsers() {

  /* -------------------------------------------------------
     USERS
  ------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState('USER')

  const [users, setUsers] = useState([])

  /* -------------------------------------------------------
     PAGINATION
  ------------------------------------------------------- */

  const [currentPageByRole, setCurrentPageByRole] =
    useState({
      USER: 1,
      PHARMACY_OWNER: 1,
    })

  const [pageSize] =
    useState(10)

  const [paginationByRole, setPaginationByRole] =
    useState({
      USER: {
        page: 1,
        page_size: 10,
        total_users: 0,
        total_pages: 0,
      },
      PHARMACY_OWNER: {
        page: 1,
        page_size: 10,
        total_users: 0,
        total_pages: 0,
      },
    })

  const currentPage =
    currentPageByRole[activeTab] || 1

  const pagination =
    paginationByRole[activeTab] || {
      page: currentPage,
      page_size: pageSize,
      total_users: 0,
      total_pages: 0,
    }

  /* -------------------------------------------------------
     LIST LOADING / ERROR
  ------------------------------------------------------- */

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState(null)

  /* -------------------------------------------------------
     VIEW USER
  ------------------------------------------------------- */

  const [selectedUser, setSelectedUser] =
    useState(null)

  const [isViewLoading, setIsViewLoading] =
    useState(false)

  const [viewError, setViewError] =
    useState(null)

  /* -------------------------------------------------------
     EDIT USER
  ------------------------------------------------------- */

  const [editingUser, setEditingUser] =
    useState(null)

  const [isEditSaving, setIsEditSaving] =
    useState(false)

  const [editError, setEditError] =
    useState(null)

  /* -------------------------------------------------------
     ACTION LOADING
  ------------------------------------------------------- */

  const [actionLoading, setActionLoading] =
    useState(null)

  /* -------------------------------------------------------
     ACTION ERROR
  ------------------------------------------------------- */

  const [actionError, setActionError] =
    useState(null)

  /* -------------------------------------------------------
     SUCCESS MESSAGE
  ------------------------------------------------------- */

  const [successMessage, setSuccessMessage] =
    useState(null)

  /* -------------------------------------------------------
     CONFIRMATION ACTION
  ------------------------------------------------------- */

  const [confirmAction, setConfirmAction] =
    useState(null)

  /* =======================================================
     FETCH USERS
  ======================================================= */

  async function fetchUsers(
    page = currentPage,
    role = activeTab,
  ) {
    try {
      setIsLoading(true)
      setError(null)

      const response =
        await userService.getAllUsers({
          page,
          page_size: pageSize,
          role,
        })

      /*
       * Backend now returns:
       *
       * {
       *   users: [],
       *   pagination: {}
       * }
       */

      const responseData =
        response.data || {}

      const formattedUsers =
        Array.isArray(responseData.users)
          ? responseData.users.map(formatUser)
          : []

      setUsers(formattedUsers)

      setPaginationByRole(previous => ({
        ...previous,
        [role]: responseData.pagination || {
          page,
          page_size: pageSize,
          total_users: 0,
          total_pages: 0,
        },
      }))

    } catch (err) {
      console.error(
        'FAILED TO LOAD ADMIN USERS:',
        err,
      )

      setError(
        err.response?.data?.detail ||
        'Failed to load users.',
      )

    } finally {
      setIsLoading(false)
    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchUsers(currentPage, activeTab)
  }, [currentPage, activeTab])

  /* =======================================================
     VIEW USER
  ======================================================= */

  async function handleViewUser(user) {
    try {
      setIsViewLoading(true)
      setViewError(null)

      const userId =
        user.id || user._id

      if (!userId) {
        throw new Error(
          'User ID is missing.',
        )
      }

      const response =
        await userService.getUserById(
          userId,
        )

      setSelectedUser(response.data)

    } catch (err) {
      console.error(
        'FAILED TO LOAD USER:',
        err,
      )

      setViewError(
        err.response?.data?.detail ||
        'Failed to load user details.',
      )

    } finally {
      setIsViewLoading(false)
    }
  }

  /* =======================================================
     EDIT USER
  ======================================================= */

  async function handleEditUser(user) {
    try {
      setEditError(null)

      const userId =
        user.id || user._id

      if (!userId) {
        throw new Error(
          'User ID is missing.',
        )
      }

      const response =
        await userService.getUserById(
          userId,
        )

      setEditingUser(response.data)

    } catch (err) {
      console.error(
        'FAILED TO LOAD USER FOR EDIT:',
        err,
      )

      setEditError(
        err.response?.data?.detail ||
        'Failed to load user details.',
      )
    }
  }

  /* =======================================================
     SAVE USER
  ======================================================= */

  async function handleSaveUser() {

    if (!editingUser) {
      return
    }

    try {
      setIsEditSaving(true)
      setEditError(null)
      setActionError(null)
      setSuccessMessage(null)

      const userId =
        editingUser.id ||
        editingUser._id

      if (!userId) {
        throw new Error(
          'User ID is missing.',
        )
      }

      /*
       * Backend expects enum values in uppercase.
       */

      const updateData = {
        full_name:
          editingUser.full_name,

        phone_number:
          editingUser.phone_number,

        role:
          String(
            editingUser.role || 'USER',
          ).toUpperCase(),

        status:
          String(
            editingUser.status || 'ACTIVE',
          ).toUpperCase(),
      }

      await userService.updateUser(
        userId,
        updateData,
      )

      /*
       * Refresh current page.
       */

      await fetchUsers(currentPage)

      setEditingUser(null)

      setSuccessMessage(
        'User updated successfully.',
      )

    } catch (err) {
      console.error(
        'FAILED TO UPDATE USER:',
        err,
      )

      setEditError(
        err.response?.data?.detail ||
        'Failed to update user.',
      )

    } finally {
      setIsEditSaving(false)
    }
  }

  /* =======================================================
     DEACTIVATE USER
  ======================================================= */

  function handleDeactivateUser(user) {

    const userId =
      user.id || user._id

    if (!userId) {
      setActionError(
        'User ID is missing.',
      )
      return
    }

    /*
     * Prevent deactivation of an already
     * suspended or deleted user.
     */

    if (
      user.status === 'suspended' ||
      user.status === 'deleted'
    ) {
      return
    }

    /*
     * Open confirmation modal instead of
     * immediately calling the API.
     */

    setActionError(null)
    setSuccessMessage(null)

    setConfirmAction({
      type: 'deactivate',
      user,
    })
  }

  /* =======================================================
     DELETE USER
  ======================================================= */

  function handleDeleteUser(user) {

    const userId =
      user.id || user._id

    if (!userId) {
      setActionError(
        'User ID is missing.',
      )
      return
    }

    /*
     * Prevent deleting an already deleted user.
     */

    if (user.status === 'deleted') {
      return
    }

    /*
     * Open stronger confirmation modal.
     */

    setActionError(null)
    setSuccessMessage(null)

    setConfirmAction({
      type: 'delete',
      user,
    })
  }

  /* =======================================================
     CONFIRM ACTION
  ======================================================= */

  async function handleConfirmAction() {

    if (!confirmAction?.user) {
      return
    }

    const user =
      confirmAction.user

    const action =
      confirmAction.type

    const userId =
      user.id || user._id

    if (!userId) {
      setActionError(
        'User ID is missing.',
      )

      setConfirmAction(null)

      return
    }

    try {
      setActionError(null)
      setSuccessMessage(null)

      setActionLoading({
        userId,
        action,
      })

      /*
       * Close confirmation modal while
       * the API request is running.
       */

      setConfirmAction(null)

      if (action === 'deactivate') {
        await userService.deactivateUser(
          userId,
        )
      }

      if (action === 'delete') {
        await userService.deleteUser(
          userId,
        )

        /*
         * Close any open modal for this user.
         */

        setSelectedUser(null)
        setEditingUser(null)
      }

      /*
       * Reload the current page.
       */

      await fetchUsers(currentPage)

      setSuccessMessage(
        action === 'deactivate'
          ? 'User deactivated successfully.'
          : 'User deleted successfully.',
      )

    } catch (err) {
      console.error(
        `FAILED TO ${action.toUpperCase()} USER:`,
        err,
      )

      setActionError(
        err.response?.data?.detail ||
        (
          action === 'deactivate'
            ? 'Failed to deactivate user.'
            : 'Failed to delete user.'
        ),
      )

    } finally {
      setActionLoading(null)
    }
  }

  /* =======================================================
     ROLE TAB HANDLER
  ======================================================= */

  function handleTabChange(role) {
    if (role === activeTab || isLoading) {
      return
    }

    setActiveTab(role)
    setError(null)
    setActionError(null)
    setSuccessMessage(null)
  }

  /* =======================================================
     PAGINATION HANDLERS
  ======================================================= */

  function handlePreviousPage() {
    if (
      currentPage > 1 &&
      !isLoading
    ) {
      setCurrentPageByRole(previous => ({
        ...previous,
        [activeTab]: currentPage - 1,
      }))
    }
  }

  function handleNextPage() {
    if (
      currentPage <
        pagination.total_pages &&
      !isLoading
    ) {
      setCurrentPageByRole(previous => ({
        ...previous,
        [activeTab]: currentPage + 1,
      }))
    }
  }

  function handlePageChange(page) {
    if (
      page >= 1 &&
      page <= pagination.total_pages &&
      page !== currentPage &&
      !isLoading
    ) {
      setCurrentPageByRole(previous => ({
        ...previous,
        [activeTab]: page,
      }))
    }
  }

  /* =======================================================
     GENERATE PAGE NUMBERS
  ======================================================= */

  function getPageNumbers() {

    const totalPages =
      pagination.total_pages

    if (totalPages <= 0) {
      return []
    }

    /*
     * Show all pages when there are only
     * a few pages.
     */

    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      )
    }

    /*
     * For many pages, keep the pagination
     * compact.
     */

    const pages = []

    pages.push(1)

    if (currentPage > 4) {
      pages.push('...')
    }

    const startPage =
      Math.max(2, currentPage - 1)

    const endPage =
      Math.min(
        totalPages - 1,
        currentPage + 1,
      )

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page)
    }

    if (
      currentPage <
      totalPages - 3
    ) {
      pages.push('...')
    }

    pages.push(totalPages)

    return pages
  }

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = getColumns(
    handleViewUser,
    handleEditUser,
    handleDeactivateUser,
    handleDeleteUser,
    actionLoading,
  )

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article className="space-y-6">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          User Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage registered users across all roles.
        </p>
      </div>

      {/* ===================================================
          SUCCESS MESSAGE
      =================================================== */}

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">

          <p className="text-sm font-medium text-green-700">
            {successMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage(null)
            }
            className="rounded p-1 text-green-600 hover:bg-green-100"
            aria-label="Close success message"
          >
            <HiOutlineXMark size={18} />
          </button>

        </div>
      )}

      {/* ===================================================
          ACTION ERROR
      =================================================== */}

      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm font-medium text-red-700">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() =>
              setActionError(null)
            }
            className="rounded p-1 text-red-500 hover:bg-red-100"
            aria-label="Close error"
          >
            <HiOutlineXMark size={18} />
          </button>

        </div>
      )}

      {/* ===================================================
          ROLE TABS
      =================================================== */}

      <div className="flex w-full gap-2 rounded-xl border border-slate-200 bg-white p-1 sm:w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('USER')}
          disabled={isLoading}
          className={
            activeTab === 'USER'
              ? 'rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm'
              : 'rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          Users
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('PHARMACY_OWNER')}
          disabled={isLoading}
          className={
            activeTab === 'PHARMACY_OWNER'
              ? 'rounded-lg bg-secondary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm'
              : 'rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          Pharmacy Owners
        </button>
      </div>

      {/* ===================================================
          LOADING
      =================================================== */}

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">

          <p className="text-sm text-slate-500">
            Loading users...
          </p>

        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchUsers(currentPage)
            }
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>

        </div>
      )}

      {/* ===================================================
          USER TABLE
      =================================================== */}

      {!isLoading && !error && (
        <>
          <AdminTable
            columns={columns}
            data={users}
            searchPlaceholder="Search users by name, email or role…"
            ariaLabel="Users management table"
          />

          {/* =================================================
              PAGINATION
          ================================================= */}

          {pagination.total_pages > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row">

              {/* TOTAL USERS */}

              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {users.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-700">
                  {pagination.total_users}
                </span>{' '}
                users
              </p>

              {/* PAGINATION CONTROLS */}

              <div className="flex items-center gap-1">

                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={
                    currentPage === 1 ||
                    isLoading
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {/* PAGE NUMBERS */}

                <div className="flex items-center gap-1">

                  {getPageNumbers().map(
                    (page, index) => {

                      if (
                        page === '...'
                      ) {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-xs text-slate-400"
                          >
                            ...
                          </span>
                        )
                      }

                      const isActive =
                        page ===
                        currentPage

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() =>
                            handlePageChange(
                              page,
                            )
                          }
                          disabled={isLoading}
                          className={
                            isActive
                              ? 'min-w-9 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white'
                              : 'min-w-9 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                          }
                        >
                          {page}
                        </button>
                      )
                    },
                  )}

                </div>

                {/* NEXT */}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={
                    currentPage ===
                      pagination.total_pages ||
                    pagination.total_pages === 0 ||
                    isLoading
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>
          )}
        </>
      )}

      {/* ===================================================
          CONFIRMATION MODAL
      =================================================== */}

      {confirmAction && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!actionLoading) {
              setConfirmAction(null)
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
            onClick={event =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {confirmAction.type === 'delete'
                    ? 'Delete User'
                    : 'Deactivate User'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {confirmAction.type === 'delete'
                    ? 'This action cannot be undone.'
                    : 'The user account will be suspended.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfirmAction(null)
                }
                disabled={Boolean(actionLoading)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close confirmation"
              >
                <HiOutlineXMark
                  size={20}
                />
              </button>

            </div>

            {/* BODY */}

            <div className="p-6">

              <div
                className={
                  confirmAction.type === 'delete'
                    ? 'rounded-xl border border-red-200 bg-red-50 p-4'
                    : 'rounded-xl border border-amber-200 bg-amber-50 p-4'
                }
              >

                <p
                  className={
                    confirmAction.type === 'delete'
                      ? 'text-sm font-medium text-red-700'
                      : 'text-sm font-medium text-amber-700'
                  }
                >
                  {confirmAction.type === 'delete'
                    ? `Are you sure you want to permanently delete ${confirmAction.user.name}?`
                    : `Are you sure you want to deactivate ${confirmAction.user.name}?`}
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  {confirmAction.type === 'delete'
                    ? 'All access to this user account will be removed permanently.'
                    : 'The user will no longer be able to use their account while it is suspended.'}
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setConfirmAction(null)
                }
                disabled={Boolean(actionLoading)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={Boolean(actionLoading)}
                className={
                  confirmAction.type === 'delete'
                    ? 'rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                    : 'rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50'
                }
              >
                {actionLoading
                  ? 'Processing...'
                  : confirmAction.type === 'delete'
                    ? 'Delete Permanently'
                    : 'Deactivate'}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ===================================================
          VIEW USER MODAL
      =================================================== */}

      {(selectedUser ||
        isViewLoading ||
        viewError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!isViewLoading) {
              setSelectedUser(null)
              setViewError(null)
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={event =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  User Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Complete user information
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null)
                  setViewError(null)
                }}
                disabled={isViewLoading}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close user details"
              >
                <HiOutlineXMark
                  size={20}
                />
              </button>

            </div>

            {/* BODY */}

            <div className="p-6">

              {isViewLoading && (
                <div className="py-8 text-center">

                  <p className="text-sm text-slate-500">
                    Loading user details...
                  </p>

                </div>
              )}

              {viewError &&
                !isViewLoading && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                    <p className="text-sm text-red-600">
                      {viewError}
                    </p>

                  </div>
                )}

              {selectedUser &&
                !isViewLoading &&
                !viewError && (
                  <div className="space-y-5">

                    <UserDetail
                      label="Name"
                      value={
                        selectedUser.full_name
                      }
                    />

                    <UserDetail
                      label="Email"
                      value={
                        selectedUser.email
                      }
                    />

                    <UserDetail
                      label="Phone"
                      value={
                        selectedUser.phone_number
                      }
                    />

                    <div className="grid grid-cols-2 gap-4">

                      <UserDetail
                        label="Role"
                        value={
                          selectedUser.role
                        }
                      />

                      <UserDetail
                        label="Status"
                        value={
                          selectedUser.status
                        }
                      />

                    </div>

                    <UserDetail
                      label="Email Verified"
                      value={
                        selectedUser.is_email_verified
                          ? 'Yes'
                          : 'No'
                      }
                    />

                    <UserDetail
                      label="Created At"
                      value={
                        selectedUser.created_at
                          ? new Date(
                              selectedUser.created_at,
                            ).toLocaleString()
                          : '—'
                      }
                    />

                  </div>
                )}

            </div>

            {/* FOOTER */}

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null)
                  setViewError(null)
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ===================================================
          EDIT USER MODAL
      =================================================== */}

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!isEditSaving) {
              setEditingUser(null)
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={event =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit User
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Update user account details
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingUser(null)
                }
                disabled={isEditSaving}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close edit user"
              >
                <HiOutlineXMark
                  size={20}
                />
              </button>
            </div>
            {/* FORM */}
            <div className="space-y-4 p-6">
              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {editError}
                </div>
              )}
              {/* FULL NAME */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={
                    editingUser.full_name ||
                    ''
                  }
                  onChange={event =>
                    setEditingUser({
                      ...editingUser,
                      full_name:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              {/* EMAIL */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  value={
                    editingUser.email ||
                    ''
                  }
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                />
              </div>
              {/* PHONE */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={
                    editingUser.phone_number ||
                    ''
                  }
                  onChange={event =>
                    setEditingUser({
                      ...editingUser,
                      phone_number:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              {/* ROLE */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Role
                </label>
                <select
                  value={
                    String(
                      editingUser.role ||
                        'USER',
                    ).toUpperCase()
                  }
                  onChange={event =>
                    setEditingUser({
                      ...editingUser,
                      role:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="USER">
                    USER
                  </option>
                  <option value="PHARMACY_OWNER">
                    PHARMACY_OWNER
                  </option>
                  <option value="ADMIN">
                    ADMIN
                  </option>
                </select>
              </div>
              {/* STATUS */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Status
                </label>
                <select
                  value={
                    String(
                      editingUser.status ||
                        'ACTIVE',
                    ).toUpperCase()
                  }
                  onChange={event =>
                    setEditingUser({
                      ...editingUser,
                      status:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="ACTIVE">
                    ACTIVE
                  </option>
                  <option value="SUSPENDED">
                    SUSPENDED
                  </option>
                  <option value="DELETED">
                    DELETED
                  </option>
                </select>
              </div>
            </div>
            {/* FOOTER */}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setEditingUser(null)
                }
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
                {isEditSaving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>

            </div>

          </div>
        </div>
      )}

    </article>
  )
}
/* =========================================================
   USER DETAIL COMPONENT
========================================================= */
function UserDetail({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || '—'}
      </p>

    </div>
  )
}
export default AdminUsers