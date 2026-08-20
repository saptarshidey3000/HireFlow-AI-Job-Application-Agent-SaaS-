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
        "flex gap-1.5 overflow-x-auto rounded-lg border-2 border-[#2d3835] bg-[#141414] p-1.5 shadow-[3px_3px_0px_0px_#000000] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
        "inline-flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-all duration-120 outline-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-[#3fa98a]/50",
        selected
          ? "border-2 border-[#2b8a70] bg-[#0d3b2e] text-white shadow-[2px_2px_0px_0px_#000000]"
          : "border-2 border-transparent text-[#A7A7A7] hover:border-[#384843] hover:bg-[#242424] hover:text-white",
        className
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-[4px]",
            selected
              ? "bg-[#2b8a70]/30 text-[#3FA98A]"
              : "bg-[#242424] text-[#707070]"
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
