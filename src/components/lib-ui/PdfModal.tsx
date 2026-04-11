import { DialogContent } from "@/components/ui/dialog"
import PdfReader from "./PdfReader"

type PdfModalProps = {
  url: string
}

export function PdfModal( { url }: PdfModalProps) {
  return (
      <DialogContent
        overlayMode="custom"
        className="flex h-[min(90vh,900px)] w-[min(95vw,1200px)] max-w-[95vw] min-h-0 flex-col gap-0 overflow-hidden p-4 pt-12 sm:max-w-[95vw]"
      >
        <PdfReader url={url} />
      </DialogContent>
  )
}
