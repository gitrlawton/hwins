"use client";

import { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase";
import SAMPLE_PROJECTS from "../mock-project-data.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, Star, Moon } from "lucide-react";
import ProjectCard from "@/components/custom/ProjectCard";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, "devpost_projects");
        const projectSnapshot = await getDocs(projectsCollection);
        const projectList = projectSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Fallback to sample projects if fetch fails
        setProjects(SAMPLE_PROJECTS);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Search
          </label>
          <Input
            placeholder="Search by keyword"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted"
            disabled
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Sort by
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2">
          <Button variant="outline" className="space-x-2 w-28">
            <span>Filters</span>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 px-3 space-x-1 flex items-center"
          >
            <span className="text-sm font-medium mr-1">3255</span>
            <Star className="h-4 w-4 flex-shrink-0" />
            <span className="sr-only">GitHub Stars</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Moon className="h-4 w-4" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isExpanded={expandedProjectId === project.id}
            onToggleExpand={() =>
              setExpandedProjectId(
                expandedProjectId === project.id ? null : project.id
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
