import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

type CardProps = React.ComponentProps<typeof Card> & {
  title?: string,
  footer?: string
  description?: string
}

export function ListItem({
  className, title, children, description, ...props
}: CardProps) {
  return (
    <Card className={cn("group w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex w-full flex-col items-start">
          <CardTitle>{title}</CardTitle>
          <small>{description}</small>
        </div>
        {children ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 origin-right scale-0 opacity-0 pointer-events-none transition-all duration-200 ease-in group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
              {children}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Toggle actions"
              className="h-9 w-9 rounded-full transition duration-200 ease-in"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ) : null}
      </CardHeader>
    </Card>
  )
}
