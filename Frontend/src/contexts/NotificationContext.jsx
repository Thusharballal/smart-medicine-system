import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react'
import { MAX_NOTIFICATIONS } from '../config/constants'

/**
 * NotificationContext – manages in-app notification state.
 *
 * State shape:
 *   {
 *     notifications: Notification[],  // most-recent-first
 *     unreadCount:   number,
 *   }
 *
 * Notification shape:
 *   {
 *     id:        string,
 *     type:      'Price_Drop' | 'Stock_Available' | 'System_Announcement',
 *     title:     string,
 *     message:   string,  // max 100 chars displayed
 *     createdAt: ISO string,
 *     isRead:    boolean,
 *     actionUrl?: string,
 *   }
 *
 * Actions: ADD | MARK_READ | MARK_ALL_READ | REMOVE | RESET
 */

const MAX_NOTIFICATIONS_LOCAL = MAX_NOTIFICATIONS // alias to avoid lint "no-shadow"

const initialState = {
  notifications: [],
  unreadCount: 0,
}

function notificationReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const next = [action.notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS_LOCAL)
      const unread = next.filter((n) => !n.isRead).length
      return { notifications: next, unreadCount: unread }
    }
    case 'MARK_READ': {
      const next = state.notifications.map((n) =>
        n.id === action.id ? { ...n, isRead: true } : n
      )
      return { notifications: next, unreadCount: next.filter((n) => !n.isRead).length }
    }
    case 'MARK_ALL_READ': {
      const next = state.notifications.map((n) => ({ ...n, isRead: true }))
      return { notifications: next, unreadCount: 0 }
    }
    case 'REMOVE': {
      const next = state.notifications.filter((n) => n.id !== action.id)
      return { notifications: next, unreadCount: next.filter((n) => !n.isRead).length }
    }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

let _nid = 1

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  const addNotification = useCallback((notification) => {
    dispatch({
      type: 'ADD',
      notification: {
        id: notification.id ?? String(_nid++),
        isRead: false,
        createdAt: notification.createdAt ?? new Date().toISOString(),
        ...notification,
      },
    })
  }, [])

  const markRead = useCallback((id) => {
    dispatch({ type: 'MARK_READ', id })
  }, [])

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' })
  }, [])

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  const resetNotifications = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        addNotification,
        markRead,
        markAllRead,
        removeNotification,
        resetNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}

export default NotificationContext
