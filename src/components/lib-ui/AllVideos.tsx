import { useEffect, useState } from "react"
import { PaginationWithLinks } from "./VideosPagination"
import { useLocation } from "react-router";
import { getVimeoVideos } from "@/services/videos";
import { ListItem } from "./ListItem";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { VideoModal } from "./VideoModal";
import { MonitorPlay } from "lucide-react";

type AllVideosProps = {
  loading: boolean,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}


function AllVideos({ loading, setLoading }: AllVideosProps) {
  const [videos, setVideos] = useState<Array<any>>([])
  const [total, setTotal] = useState(0)

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  useEffect(() => {

    (async () => {
      setLoading(true)
      const { data } = await getVimeoVideos(page, pageSize);
      setTotal(data.data.total);
      setVideos(data.data.data);
      setLoading(false)
    })()
    
  }, [pageSize, page])

  return (
    <div className="grid gap-4">
      {!loading && videos
        .map((video) => (
          <ListItem
              key={video.uri}
              title={video.name}
              description={video.description}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="inline-flex h-12 w-12 items-center justify-center !rounded-full " variant={"secondary"} size={"icon"}><MonitorPlay /></Button>
                </DialogTrigger>
                <VideoModal id={video.uri?.replace('/videos/','')} />
              </Dialog>
            </ListItem>
        ))}
        <div className="mt-12">
      <PaginationWithLinks
        page={page}
        pageSize={pageSize}
        totalCount={total}
        pageSizeSelectOptions={{
          pageSizeOptions: [5, 10, 15, 20, 25],
        }}
      /></div>
    </div>
  )
}

export default AllVideos