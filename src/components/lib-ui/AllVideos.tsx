import { useState } from "react"
import { PaginationWithLinks } from "./VideosPagination"
import { useLocation } from "react-router";


function AllVideos() {
  const [videos, setVideos] = useState<Array<any>>([1, 2])

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  return (
    <>
      {videos
        .map((video) => (
          <div key={video}>AllVideos</div>
        ))}
      <PaginationWithLinks
        page={page}
        pageSize={pageSize}
        totalCount={500}
        pageSizeSelectOptions={{
          pageSizeOptions: [5, 10, 25],
        }}
      />
    </>
  )
}

export default AllVideos