import {
  DialogContent,

} from "@/components/ui/dialog"
import VideoPlayer from "./VideoPlayer"

type VideoModalProps = {
  id: string
}

export function VideoModal( { id }: VideoModalProps) {
  return (
      <DialogContent className="sm:max-w-fit">
        <VideoPlayer id={id} />
      </DialogContent>
  )
}
