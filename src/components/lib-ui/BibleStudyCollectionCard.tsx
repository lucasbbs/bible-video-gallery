import { ArrowLeftIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { CollectionArtwork } from "./CollectionArtwork";
import { BibleStudyCollection } from "@/types/collection";


type BibleStudyCollectionCardProps = {
  featuredImage?: string | null;
  name: string;
  description: string;
  imageFailed: boolean;
  setImageFailed: (value: boolean) => void;
  collection: BibleStudyCollection
  eager: boolean
  iconClassName?: string
};

export function BibleStudyCollectionCard({ featuredImage, name, description, imageFailed, setImageFailed, collection, eager, iconClassName }: BibleStudyCollectionCardProps) {

  const navigate = useNavigate();
return (
  <>
                      {featuredImage && !imageFailed ? (
                        <img
                            src={featuredImage}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-muted to-background text-primary">
                             <CollectionArtwork
                                  collection={collection}
                                  eager={eager}
                                  className="absolute inset-0 h-full w-full object-cover"
                                  iconClassName={iconClassName}
                              />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/35 to-background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/65 via-transparent to-transparent" />

                    <Button
                        asChild
                        variant="secondary"
                        size="icon"
                        className="absolute left-5 top-5 z-10 size-11 rounded-full bg-background/85 shadow-md backdrop-blur hover:bg-background sm:left-8 sm:top-8 cursor-pointer"
                        onClick={() => navigate(-1)}
                    >
                        <span>
                            <ArrowLeftIcon  size={10} />
                        </span>
                    </Button>

                    <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-10 sm:pb-10 lg:px-14">
                        <div className="max-w-4xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary sm:text-sm">
                                Bible study collection
                            </p>
                            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-foreground drop-shadow-sm sm:text-5xl lg:text-6xl">
                                {name}
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                                {description}
                            </p>
                        </div>
                    </div>
</>
)
}