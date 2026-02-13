
import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  youtubeId: string;
  title?: string;
}

export default function VideoPlayer({ youtubeId, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
      {/* Thumbnail Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer z-10 group"
          onClick={() => setIsPlaying(true)}>
          <button className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform group-hover:scale-110">
            <Play className="w-7 h-7 ml-1" />
          </button>
        </div>
      )}

      {/* YouTube Iframe */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}${isPlaying ? "?autoplay=1" : ""}`}
          title={title || "Video"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
