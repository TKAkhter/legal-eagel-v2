import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, LinearProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store/auth-store'

const IDLE_WARNING_AFTER_MS = 14 * 60 * 1000 // warn at 14 minutes idle
const IDLE_LOGOUT_AFTER_MS = 15 * 60 * 1000 // auto-logout at 15 minutes idle
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

/**
 * Sits once near the root of the authenticated shell (see
 * `DashboardLayout`). Tracks user activity via a handful of passive
 * listeners, shows a warning dialog with a countdown before the session
 * would expire, and clears the session if the user doesn't respond.
 * Timers are plain constants here for the boilerplate — wire these to
 * env vars if session length should be configurable per deployment.
 */
export function IdleTimeoutModal() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const clearSession = useAuthStore((s) => s.clearSession)

  const [warningOpen, setWarningOpen] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const countdownInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const handleLogout = useCallback(() => {
    clearSession()
    setWarningOpen(false)
    navigate('/login')
  }, [clearSession, navigate])

  const resetTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (countdownInterval.current) clearInterval(countdownInterval.current)
    setWarningOpen(false)

    if (!isAuthenticated) return

    warningTimer.current = setTimeout(() => {
      setWarningOpen(true)
      setSecondsLeft(Math.round((IDLE_LOGOUT_AFTER_MS - IDLE_WARNING_AFTER_MS) / 1000))
      countdownInterval.current = setInterval(() => {
        setSecondsLeft((s) => Math.max(0, s - 1))
      }, 1000)
    }, IDLE_WARNING_AFTER_MS)

    logoutTimer.current = setTimeout(handleLogout, IDLE_LOGOUT_AFTER_MS)
  }, [isAuthenticated, handleLogout])

  useEffect(() => {
    if (!isAuthenticated) return
    resetTimers()

    const onActivity = () => {
      // Only reset from user activity while the warning isn't showing —
      // once the warning is up, only the explicit button clears it.
      if (!warningOpen) resetTimers()
    }
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }))

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity))
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
      if (countdownInterval.current) clearInterval(countdownInterval.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const stayLoggedIn = () => resetTimers()

  return (
    <Dialog open={warningOpen} onClose={stayLoggedIn} maxWidth="xs" fullWidth>
      <DialogTitle>Still there?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          You'll be signed out in {secondsLeft}s due to inactivity.
        </DialogContentText>
        <LinearProgress
          variant="determinate"
          value={(secondsLeft / ((IDLE_LOGOUT_AFTER_MS - IDLE_WARNING_AFTER_MS) / 1000)) * 100}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout}>Log out</Button>
        <Button variant="contained" onClick={stayLoggedIn} autoFocus>
          Stay signed in
        </Button>
      </DialogActions>
    </Dialog>
  )
}
