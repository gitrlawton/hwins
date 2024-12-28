import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, ChevronDown, ChevronUp, Trophy, Tag } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

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
          <div className="flex-grow min-w-0 w-full line-clamp-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg leading-tight">
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
            <p className="text-sm text-muted-foreground leading-snug line-clamp-1 mt-0.5 md:max-w-[450px] lg:max-w-[690px] xl:max-w-[940px] 2xl:max-w-[1200px]">
              {project.log_line}
            </p>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-4 md:max-w-[450px] lg:max-w-[690px] xl:max-w-[940px] 2xl:max-w-[1200px]">
              {/**
               * Removed min-w-0 from the trophies div to ensure it doesn't give up any space prematurely.
               * flex-shrink-0 to ensure the trophies div never shrinks when there’s contention for space.
               * max-w-full to allow it to utilize all available space up to its parent’s width.
               */}
              <div className="flex items-center flex-shrink-0 max-w-full">
                {/* <Trophy className="h-3 w-3 mr-1 flex-shrink-0" /> */}
                {/**
                 * The truncate class is responsible for ensuring that the text within the <span> is truncated with an ellipsis
                 */}
                <span className="truncate">
                  {project.fields_won.map((field) => `🏆 ${field}`).join(" ")}
                </span>
              </div>
              {/**
               * min-w-0 to allow truncation of the tags.
               * flex-shrink to ensure the tags give up space when needed.
               */}
              {project.tags.length > 0 && (
                <div className="hidden lg:flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-0 flex-shrink truncate">
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
              )}
            </div>
          </div>
          <div className="text-sm hidden md:block text-muted-foreground flex-shrink-0 pr-4">
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
              {/* <div className="space-y-2">
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
              </div> */}
            </div>

            <div className="relative">
              <div className="space-y-6 pb-8">
                {/* <div>
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
                </div> */}

                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  {!project.features || project.features.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Please visit the project page on Devpost for this info.
                    </p>
                  ) : (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {project.features.map((feature) => (
                        <li key={feature}>
                          • {feature.charAt(0).toUpperCase() + feature.slice(1)}
                        </li>
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
                  <div className="flex flex-wrap gap-2">
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
