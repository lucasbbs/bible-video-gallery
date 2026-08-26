import ReactPlayer from "react-player";
import { useMediaQuery } from 'react-responsive'

type MediaPlayerProps = {
  url: string;
};

function MediaPlayer({ url }: MediaPlayerProps) {
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' })

  return (
    <div className={`${isMobile && 'relative pt-[56.25%]'}`}>
      <ReactPlayer style={isMobile ? { top: 0, left: 0 } : undefined}
      className={`${ isMobile && 'absolute top-0 left-0'}`}
      {...isMobile && {width: '100%', height: '100%'}}
        url={url}
        controls
      />
    </div>
  );
}

export default MediaPlayer;