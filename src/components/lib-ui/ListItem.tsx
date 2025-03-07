import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CardProps = React.ComponentProps<typeof Card> & {
  title?: string,
  footer?: string
  description?: string
}

export function ListItem({
  className, title, children, description, ...props
}: CardProps) {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="w-full flex flex-col items-start">
          <CardTitle>{title}</CardTitle>
          <small>{description}</small>
        </div>
        {children}
      </CardHeader>
    </Card>
  )
}
