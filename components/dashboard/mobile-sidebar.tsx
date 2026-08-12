"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

import { Sidebar } from "./sidebar"

export function MobileSidebar({
  open,
  onOpenChange,
  hydrated,
  onToggle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hydrated: boolean
  onToggle: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[280px] max-w-[85vw] border-r border-[#333333] bg-[rgba(0,0,0,0.92)] p-0 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          HireFlow dashboard navigation
        </SheetDescription>
        <Sidebar
          collapsed={false}
          hydrated={hydrated}
          onToggle={onToggle}
          className="h-full w-full border-r-0"
        />
      </SheetContent>
    </Sheet>
  )
}
