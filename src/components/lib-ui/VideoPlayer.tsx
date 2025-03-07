import ReactPlayer from "react-player";
import { useMediaQuery } from 'react-responsive'

type VideoPlayerProps = {
  id: string;
};

function VideoPlayer({ id }: VideoPlayerProps) {
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' })

  console.log(isMobile)
  return (
    <div className={`${isMobile && 'relative pt-[56.25%]'}`}>
      <ReactPlayer style={isMobile ? { top: 0, left: 0 } : undefined}
      className={`${ isMobile && 'absolute top-0 left-0'}`}
      {...isMobile && {width: '100%', height: '100%'}}
        url={`https://player.vimeo.com/video/${id}`}
        controls
      />
    </div>
  );
}

export default VideoPlayer;