import { useEffect, useRef } from 'react'

const useDeferredScript = (src, { id = 'main-js', waitForSelector = '#main-content' } = {}) => {
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (hasLoadedRef.current) return undefined

    const existing = document.querySelector(`script[data-script-id="${id}"]`)
    if (existing) {
      hasLoadedRef.current = true
      return undefined
    }

    let canceled = false
    let observer

    const inject = () => {
      if (canceled || hasLoadedRef.current) return
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.dataset.scriptId = id
      document.body.appendChild(script)
      hasLoadedRef.current = true
    }

    const isReady = () => {
      if (document.readyState === 'loading') return false
      if (!waitForSelector) return true
      return Boolean(document.querySelector(waitForSelector))
    }

    const tryInject = () => {
      if (canceled || hasLoadedRef.current) return
      if (!isReady()) return
      // Wait two frames so the route DOM is painted before the script runs.
      requestAnimationFrame(() => requestAnimationFrame(inject))
      if (observer) observer.disconnect()
    }

    const onReady = () => {
      tryInject()
    }

    document.addEventListener('DOMContentLoaded', onReady)
    tryInject()

    if (waitForSelector) {
      observer = new MutationObserver(tryInject)
      observer.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      canceled = true
      document.removeEventListener('DOMContentLoaded', onReady)
      if (observer) observer.disconnect()
    }
  }, [id, src, waitForSelector])
}

export default useDeferredScript
