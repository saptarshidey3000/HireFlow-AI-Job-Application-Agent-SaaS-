"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "hireflow-sidebar-collapsed"

function readCollapsed(defaultCollapsed: boolean) {
  if (typeof window === "undefined") return defaultCollapsed

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === null) return defaultCollapsed

  return stored === "true"
}

export function useSidebarState(defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const mqTablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)")
    const defaultValue = mqTablet.matches
    setCollapsed(readCollapsed(defaultValue))
    setHydrated(true)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const setCollapsedPersisted = useCallback((value: boolean) => {
    setCollapsed(value)
    localStorage.setItem(STORAGE_KEY, String(value))
  }, [])

  return {
    collapsed,
    hydrated,
    toggleCollapsed,
    setCollapsed: setCollapsedPersisted,
  }
}
