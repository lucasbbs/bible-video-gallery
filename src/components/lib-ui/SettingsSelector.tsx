import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { SettingsIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { useSidebar } from "@/components/ui/sidebar"
import { DEFAULT_TEXT_SIZE_PX, useUiSettings } from "./UiSettingsContext"

export const SettingsSelector = () => {
  const { isMobile, openComponent, setOpenComponent, state: sidebarState } =
    useSidebar()
  const [open, setOpen] = useState(false)
  const { darkMode, setDarkMode, textSize, setTextSize, minTextSize, maxTextSize } =
    useUiSettings()

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setOpenComponent("settings")
      return
    }

    setOpenComponent((current) => {
      if (current !== "settings") return current
      return sidebarState === "expanded" ? "sidebar" : ""
    })
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open settings"
          className={`fixed top-40 right-4 ${openComponent === "settings" ? "z-60" : "z-30" } ${isMobile ? 'h-12 w-12' : 'h-fit w-fit px-5 py-2'} !rounded-full`}
          size="icon"
          variant="secondary"
        >
          <SettingsIcon size={60} /> {isMobile ? null : <span>Settings</span>}
        </Button>
      </PopoverTrigger>
      {isMobile && open ? (
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => handleOpenChange(false)}
            className="fixed inset-0 z-50 !bg-black/50 md:hidden"
          />
        ) : null}
      <PopoverContent align="start" side="bottom" sideOffset={12} className="w-80 mr-3">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">Customize your view.</p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="setting-dark-mode">Dark mode</Label>
              <Switch
                id="setting-dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="setting-text-size">Large text</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Decrease text size"
                  disabled={textSize <= minTextSize}
                  onClick={() => setTextSize((prev) => prev - 1)}
                >
                  <MinusIcon />
                </Button>
                <span className="w-12 text-center tabular-nums">{textSize}px</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Increase text size"
                  disabled={textSize >= maxTextSize}
                  onClick={() => setTextSize((prev) => prev + 1)}
                >
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setDarkMode(false)
              setTextSize(DEFAULT_TEXT_SIZE_PX)
            }}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
