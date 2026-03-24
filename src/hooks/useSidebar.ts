import { useState } from "react"

function getStoredCollapsed(): boolean {
  return localStorage.getItem("sidebarCollapsed") === "true"
}

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(getStoredCollapsed)

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebarCollapsed", String(next))
      return next
    })
  }

  return { collapsed, toggle }
}
