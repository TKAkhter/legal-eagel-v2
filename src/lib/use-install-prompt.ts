import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Chrome/Edge/Android fire `beforeinstallprompt` when the app is
 * installable; capturing it lets us show our own "Install app" button
 * (e.g. in Settings) instead of only relying on the browser's address-bar
 * icon. Safari/iOS never fire this event — `canInstall` just stays
 * false there, which is expected (users add-to-homescreen manually).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return { canInstall: !!deferredPrompt, promptInstall }
}
