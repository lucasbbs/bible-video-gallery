import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEFAULT_TYPE, TYPE_VALUES, TypeValue } from "./contants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTabValue(value: string | null): TypeValue {
    if (!value) return DEFAULT_TYPE
    if ((TYPE_VALUES as readonly string[]).includes(value)) return value as TypeValue
    return DEFAULT_TYPE
}
