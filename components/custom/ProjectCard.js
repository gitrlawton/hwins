import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, ChevronDown, ChevronUp, Trophy, Tag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ProjectCard({ project, isExpanded, onToggleExpand }) {
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div className="rounded-lg border bg-stone-100 dark:bg-stone-800 text-card-foreground shadow-sm dark:border-neutral-900 special:bg-red-500">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 relative w-[60px] h-[60px]">
            <Image
              src={project.thumbnail_url || "/placeholder.svg"}
              alt={project.project_name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {project.project_name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="p-0 h-auto"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-snug line-clamp-1 mt-0.5 max-w-[875px]">
              {project.log_line}
            </p>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-4">
              <div className="flex items-center">
                <Trophy className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {project.fields_won.join(", ")}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Tag className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {project.tags.map((tag, i) => (
                    <span key={tag}>
                      {tag}
                      {i < project.tags.length - 1 && " • "}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex-shrink-0">
            {project.project_date}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="aspect-video rounded-lg bg-muted">
                <iframe
                  src={project.video_url}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled
                />
                <div className="flex justify-between">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    disabled
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                    />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  <Button size="sm" disabled>
                    Comment
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="space-y-6 pb-8">
                <div>
                  <div>
                    <h4 className="font-medium mb-2">
                      {project.hackathon_names.length === 1
                        ? "Hackathon"
                        : "Hackathons"}
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {project.hackathon_names.join("\n")}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  {!project.features || project.features.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Please visit the project page on Devpost for this info.
                    </p>
                  ) : (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {project.features.map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Creators</h4>
                  <div className="flex gap-2">
                    {project.creators.map((creator) => (
                      <a
                        key={creator.name}
                        href={creator.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Avatar className="ring-1 ring-gray-300">
                          <AvatarImage
                            src={creator.profile_picture}
                            alt={creator.name}
                          />
                          <AvatarFallback>
                            {creator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 right-0">
                <a
                  href={project.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-stone-200 text-stone-800 hover:bg-stone-300 dark:text-stone-300 dark:hover:bg-stone-700 dark:bg-stone-900"
                  >
                    Visit Project
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
