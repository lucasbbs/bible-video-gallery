import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { SettingsIcon } from "lucide-react"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"

export const SettingsSelector = () => {
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('bible-video-gallery:dark-mode') === '1'
  })
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem('bible-video-gallery:large-text') === '1'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('bible-video-gallery:dark-mode', darkMode ? '1' : '0')
  }, [darkMode])

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? '18px' : ''
    localStorage.setItem('bible-video-gallery:large-text', largeText ? '1' : '0')
  }, [largeText])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open settings"
          className="fixed top-40 right-4 z-10 h-12 w-12 !rounded-full"
          size="icon"
          variant="secondary"
        >
          <SettingsIcon size={60} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="left" sideOffset={12} className="w-80">
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
              <Label htmlFor="setting-large-text">Large text</Label>
              <Switch
                id="setting-large-text"
                checked={largeText}
                onCheckedChange={setLargeText}
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setDarkMode(false)
              setLargeText(false)
            }}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}