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
import { SlidersHorizontal, Star, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import ProjectCard from "@/components/custom/ProjectCard";
import { FilterModal } from "@/components/custom/FilterModal";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // To handle hydration error on load.
  useEffect(() => {
    setMounted(true);
  }, []);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = [...projects]
    // First, filter by selected categories
    .filter((project) => {
      if (activeFilters.length === 0) return true; // Show all if no filters
      return activeFilters.every((filter) => project.tags.includes(filter));
    })
    // Then, apply sorting
    .sort((a, b) => {
      if (sortBy === "recent") {
        const dateA = new Date(a.project_date);
        const dateB = new Date(b.project_date);

        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        if (isNaN(dateA) && isNaN(dateB)) return 0;

        return dateB - dateA;
      }
      return a.project_name.localeCompare(b.project_name);
    });

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-xl dark:text-white">
            Loading Hackathon Projects...
          </p>
        </div>
      </div>
    );
  }

  // Else, show the project cards
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 dark:text-stone-200">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
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
              <SelectItem value="default">Alphabetical (Default)</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-4 w-full justify-between">
          <Button
            variant="ghost"
            className="space-x-2 w-28 border border-neutral-300 dark:hover:bg-stone-700 dark:border-neutral-700"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <span>Filters</span>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="ghost"
            size="sm"
            className="h-10 px-3 space-x-1 flex items-center"
            disabled
          >
            <span className="text-sm font-medium mr-1">3255</span>
            <Star className="h-4 w-4 flex-shrink-0" />
            <span className="sr-only">GitHub Stars</span>
          </Button> */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 text-1xl rounded-full"
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {mounted &&
              (theme === "light" ? "🤪" : <Sun className="h-4 w-4" />)}
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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={setActiveFilters}
        initialFilters={activeFilters}
      />
    </div>
  );
}
