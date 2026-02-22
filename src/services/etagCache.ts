export type EtagCacheEntry<T> = {
    etag: string
    data: T
    storedAt: number
}

function hasLocalStorage() {
    return typeof window !== 'undefined' && !!window.localStorage
}

export function buildEtagCacheKey(baseURL: string | undefined, url: string) {
    return `etag-cache:${baseURL || ''}${url}`
}

export function readEtagCache<T>(key: string): EtagCacheEntry<T> | null {
    if (!hasLocalStorage()) return null
    try {
        const raw = window.localStorage.getItem(key)
        if (!raw) return null
        return JSON.parse(raw) as EtagCacheEntry<T>
    } catch {
        return null
    }
}

export function writeEtagCache<T>(key: string, entry: EtagCacheEntry<T>) {
    if (!hasLocalStorage()) return
    try {
        window.localStorage.setItem(key, JSON.stringify(entry))
    } catch {
        // Ignore quota / serialization errors
    }
}

