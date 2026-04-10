import { DialogContent } from "@/components/ui/dialog"
import PdfReader from "./PdfReader"

type PdfModalProps = {
  url: string
}

export function PdfModal( { url }: PdfModalProps) {
  return (
      <DialogContent className="sm:max-w-fit">
        <PdfReader url={url} />
      </DialogContent>
  )
}
