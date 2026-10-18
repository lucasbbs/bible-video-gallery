import { useCallback, useMemo, useState } from 'react'
import './App.css'
import { SettingsSelector } from './components/lib-ui/SettingsSelector'
import { SidebarInset, SidebarProvider } from './components/ui/sidebar'
import { AppSidebar } from './components/lib-ui/AppSidebar'
import { ScriptureSearchProvider } from './components/lib-ui/ScriptureSearchContext'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import type { DateRange } from 'react-day-picker'
import CollectionsLibrary from './pages/CollectionsLibrary'
import { parseTabValue } from './lib/utils'
import SermonsLibrary from './pages/SermonsLibrary'
import CollectionPage from './pages/CollectionPage'

function parsePositiveInt(value: string | null, fallback: number) {
    const parsed = Number.parseInt(value || '', 10)
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback
    return parsed
}

function parseDateParam(value: string | null): Date | undefined {
    if (!value) return undefined
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return undefined

    const year = Number.parseInt(match[1], 10)
    const month = Number.parseInt(match[2], 10)
    const day = Number.parseInt(match[3], 10)
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
        return undefined
    }

    const date = new Date(year, month - 1, day)
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return undefined
    }

    return date
}

function formatDateParam(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function App() {
    const [loading, setLoading] = useState(false)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    const location = useLocation()
    const navigate = useNavigate()
    const searchParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    )

    const page = parsePositiveInt(searchParams.get('page'), 1)
    const pageSize = parsePositiveInt(searchParams.get('pageSize'), 5)
    const type = parseTabValue(searchParams.get('type'))
    const selectedDateRange = useMemo<DateRange | undefined>(() => {
        const from = parseDateParam(searchParams.get('dateFrom'))
        const to = parseDateParam(searchParams.get('dateTo'))
        if (!from && !to) return undefined
        if (from && to && from > to) return { from: to, to: from }
        return { from, to }
    }, [searchParams])

    const resetPageInUrl = useCallback(() => {
        const nextParams = new URLSearchParams(location.search)
        if (!nextParams.has('page')) return
        nextParams.delete('page')
        const qs = nextParams.toString()
        navigate(qs ? `${location.pathname}?${qs}` : location.pathname)
    }, [location.pathname, location.search, navigate])

    const setSelectedTagInUrl = useCallback(
        (nextTag: string | null) => {
            const nextParams = new URLSearchParams(location.search)

            if (nextTag) nextParams.set('tag', nextTag)
            else nextParams.delete('tag')

            nextParams.delete('page')
            const qs = nextParams.toString()
            navigate(qs ? `${location.pathname}?${qs}` : location.pathname)
        },
        [location.pathname, location.search, navigate]
    )

    const setSelectedDateRangeInUrl = useCallback(
        (nextRange: DateRange | undefined) => {
            const nextParams = new URLSearchParams(location.search)

            const nextFrom = nextRange?.from
                ? formatDateParam(nextRange.from)
                : null
            const nextTo = nextRange?.to ? formatDateParam(nextRange.to) : null

            if (nextFrom) nextParams.set('dateFrom', nextFrom)
            else nextParams.delete('dateFrom')

            if (nextTo) nextParams.set('dateTo', nextTo)
            else nextParams.delete('dateTo')

            nextParams.delete('page')

            const qs = nextParams.toString()
            navigate(qs ? `${location.pathname}?${qs}` : location.pathname)
        },
        [location.pathname, location.search, navigate]
    )

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)'
                } as React.CSSProperties
            }
        >
            <ScriptureSearchProvider
                setLoading={setLoading}
                page={page}
                pageSize={pageSize}
                type={type}
                selectedTag={selectedTag}
                selectedDateRange={selectedDateRange}
                onSetSelectedTag={setSelectedTag}
                onSetSelectedDateRange={setSelectedDateRangeInUrl}
                onResetPage={resetPageInUrl}
            >
                <AppSidebar />
                <SidebarInset>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <SermonsLibrary
                                    loading={loading}
                                    setSelectedTagInUrl={setSelectedTagInUrl}
                                    selectedTag={selectedTag}
                                    type={type}
                                />
                            }
                        />
                        <Route
                            path="/collections"
                            element={
                                <>
                                    <SettingsSelector />
                                    <CollectionsLibrary />
                                </>
                            }
                        />
                        <Route
                            path="/collection/:id"
                            element={
                                <>
                                    <CollectionPage />
                                </>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </SidebarInset>
            </ScriptureSearchProvider>
        </SidebarProvider>
    )
}

export default App
