"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within Tabs")
  }
  return context
}

function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = value ?? internalValue

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      setValue: (nextValue: string) => {
        if (value === undefined) {
          setInternalValue(nextValue)
        }
        onValueChange?.(nextValue)
      },
    }),
    [currentValue, onValueChange, value]
  )

  return (
    <TabsContext.Provider value={contextValue}>
      <div data-slot="tabs" className={cn("space-y-6", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "glass-card flex gap-1 overflow-x-auto p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

function TabsTrigger({
  value,
  children,
  icon,
  className,
}: {
  value: string
  children: ReactNode
  icon?: ReactNode
  className?: string
}) {
  const { value: selectedValue, setValue } = useTabsContext()
  const selected = selectedValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#2B8A70]/30",
        selected
          ? "bg-[rgba(13,59,46,0.55)] text-white shadow-[inset_0_0_0_1px_rgba(63,169,138,0.25)]"
          : "text-[#A7A7A7] hover:bg-[rgba(255,255,255,0.04)] hover:text-white",
        className
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            selected
              ? "bg-[rgba(63,169,138,0.18)] text-[#3FA98A]"
              : "bg-[rgba(255,255,255,0.04)] text-[#707070]"
          )}
        >
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  )
}

function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const { value: selectedValue } = useTabsContext()
  if (selectedValue !== value) return null

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={cn("focus:outline-none", className)}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
