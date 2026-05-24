import {
  DialogContent,

} from "@/components/ui/dialog"
import VideoPlayer from "./VideoPlayer"
import { MonitorPlay } from "lucide-react"

type VideoModalProps = {
  id: string
}

export function VideoModal( { id }: VideoModalProps) {

  if (!id) return (
    <DialogContent>
      <div className="flex justify-center h-80 w-full items-center">
        <div className="flex flex-col items-center">
          <MonitorPlay className="size-20" />
          <h3 className="font-semibold text-3xl">Sermon Video Coming Soon</h3>
          <div className="border-t border-gray-400 my-4 w-full"></div>
          <span className="text-center text-lg">The sermon video will be available shortly. Please check back soon.</span>
        </div>
      </div>
      </DialogContent>
  )
  return (
      <DialogContent className="sm:max-w-fit">
        <VideoPlayer id={id} />
      </DialogContent>
  )
}
