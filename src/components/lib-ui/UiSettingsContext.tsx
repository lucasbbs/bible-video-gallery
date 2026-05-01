import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"

const DARK_MODE_STORAGE_KEY = "bible-video-gallery:dark-mode"
const TEXT_SIZE_STORAGE_KEY = "bible-video-gallery:text-size"

export const DEFAULT_TEXT_SIZE_PX = 16
export const MIN_TEXT_SIZE_PX = 14
export const MAX_TEXT_SIZE_PX = 24

const clampTextSize = (value: number) =>
  Math.min(MAX_TEXT_SIZE_PX, Math.max(MIN_TEXT_SIZE_PX, value))

const readDarkModePreference = () => {
  if (typeof window === "undefined") {
    return false
  }

  return window.localStorage.getItem(DARK_MODE_STORAGE_KEY) === "1"
}

const readTextSizePreference = () => {
  if (typeof window === "undefined") {
    return DEFAULT_TEXT_SIZE_PX
  }

  const storedValue = Number(window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY))

  if (!Number.isFinite(storedValue)) {
    return DEFAULT_TEXT_SIZE_PX
  }

  return clampTextSize(storedValue)
}

type UiSettingsContextValue = {
  darkMode: boolean
  setDarkMode: Dispatch<SetStateAction<boolean>>
  textSize: number
  setTextSize: Dispatch<SetStateAction<number>>
  minTextSize: number
  maxTextSize: number
}

const UiSettingsContext = createContext<UiSettingsContextValue | null>(null)

export function useUiSettings() {
  const context = useContext(UiSettingsContext)

  if (!context) {
    throw new Error("useUiSettings must be used within a UiSettingsProvider.")
  }

  return context
}

export function UiSettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(readDarkModePreference)
  const [textSize, setTextSizeState] = useState(readTextSizePreference)

  const setTextSize: Dispatch<SetStateAction<number>> = (value) => {
    setTextSizeState((previousValue) => {
      const nextValue =
        typeof value === "function" ? value(previousValue) : value

      return clampTextSize(nextValue)
    })
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, darkMode ? "1" : "0")
  }, [darkMode])

  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}px`
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(textSize))
  }, [textSize])

  return (
    <UiSettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        textSize,
        setTextSize,
        minTextSize: MIN_TEXT_SIZE_PX,
        maxTextSize: MAX_TEXT_SIZE_PX,
      }}
    >
      {children}
    </UiSettingsContext.Provider>
  )
}
