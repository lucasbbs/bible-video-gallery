'use client'

import { useState } from 'react'

import { ChevronDownIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'
import { DateRange } from 'react-day-picker'
// import {
//     addDays,
//     addMonths,
//     endOfMonth,
//     endOfYear,
//     startOfMonth,
//     startOfYear,
//     subDays,
//     subMonths,
//     subYears
// } from 'date-fns'
import { Card, CardContent } from './card'

type DatePickerProps = {
    dateRange: DateRange | undefined
    setDateRange: (date: DateRange | undefined) => void
}

const DateRangePicker = ({ dateRange, setDateRange }: DatePickerProps) => {
    const today = new Date()

    // const yesterday = {
    //     from: subDays(today, 1),
    //     to: subDays(today, 1)
    // }

    // const tomorrow = {
    //     from: today,
    //     to: addDays(today, 1)
    // }

    // const last7Days = {
    //     from: subDays(today, 6),
    //     to: today
    // }

    // const next7Days = {
    //     from: addDays(today, 1),
    //     to: addDays(today, 7)
    // }

    // const last30Days = {
    //     from: subDays(today, 29),
    //     to: today
    // }

    // const monthToDate = {
    //     from: startOfMonth(today),
    //     to: today
    // }

    // const lastMonth = {
    //     from: startOfMonth(subMonths(today, 1)),
    //     to: endOfMonth(subMonths(today, 1))
    // }

    // const nextMonth = {
    //     from: startOfMonth(addMonths(today, 1)),
    //     to: endOfMonth(addMonths(today, 1))
    // }

    // const yearToDate = {
    //     from: startOfYear(today),
    //     to: today
    // }

    // const lastYear = {
    //     from: startOfYear(subYears(today, 1)),
    //     to: endOfYear(subYears(today, 1))
    // }

    const [month, setMonth] = useState(today)
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col space-y-2">
            <Label htmlFor="date" className="px-1">
                Date range
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className="w-full h-fit justify-between font-normal"
                    >
                        <span className="flex items-center">
                            {dateRange && dateRange.from && dateRange.to
                                ? <div><div>
                                {dateRange.from.toLocaleDateString(
                                      'en', {
                                        year: '2-digit',
                                        month: '2-digit',
                                        day: '2-digit'
                                      }
                                  )}</div> 
                                  <div>{dateRange.to.toLocaleDateString('en', {
                                      year: '2-digit',
                                      month: '2-digit',
                                      day: '2-digit'
                                  })}
                                  </div></div>
                                : 'Pick a date'}
                        </span>
                        <div className="flex items-center space-x-2">
                            {dateRange && (
                                <Button
                                    variant="outline"
                                    className="border-0 shadow-none !p-1"
                                    onClick={() => setDateRange(undefined)}
                                >
                                    <XIcon />
                                </Button>
                            )}
                            <ChevronDownIcon />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                    // side="right"
                    // sideOffset={8}
                >
                    <Card className="max-w-xs py-6 px-0">
                        <CardContent className="">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={(newDate) => {
                                    if (newDate) {
                                        setDateRange(newDate)
                                    }
                                }}
                                month={month}
                                onMonthChange={setMonth}
                                className="rounded-lg border w-60"
                            />
                        </CardContent>
                        {/* <CardFooter className="flex flex-wrap gap-2 border-t px-4 !pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange({
                                        from: today,
                                        to: today
                                    })
                                    setMonth(today)
                                }}
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(yesterday)
                                    setMonth(yesterday.to)
                                }}
                            >
                                Yesterday
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(tomorrow)
                                    setMonth(tomorrow.to)
                                }}
                            >
                                Tomorrow
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(last7Days)
                                    setMonth(last7Days.to)
                                }}
                            >
                                Last 7 days
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(next7Days)
                                    setMonth(next7Days.to)
                                }}
                            >
                                Next 7 days
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(last30Days)
                                    setMonth(last30Days.to)
                                }}
                            >
                                Last 30 days
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(monthToDate)
                                    setMonth(monthToDate.to)
                                }}
                            >
                                Month to date
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(lastMonth)
                                    setMonth(lastMonth.to)
                                }}
                            >
                                Last month
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(nextMonth)
                                    setMonth(nextMonth.to)
                                }}
                            >
                                Next month
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(yearToDate)
                                    setMonth(yearToDate.to)
                                }}
                            >
                                Year to date
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDateRange(lastYear)
                                    setMonth(lastYear.to)
                                }}
                            >
                                Last year
                            </Button>
                        </CardFooter> */}
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default DateRangePicker
