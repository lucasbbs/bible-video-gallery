import { DialogContent } from "@/components/ui/dialog"
import MediaPlayer from "./MediaPlayer"

type MediaModalProps = {
  url: string
}

export function MediaModal( { url }: MediaModalProps) {
  return (
      <DialogContent className="sm:max-w-fit">
        <MediaPlayer url={url} />
      </DialogContent>
  )
}
