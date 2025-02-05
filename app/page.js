"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import Header from "@/components/custom/Header";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] =
    useState("Nosu AI Hackathon");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [displayedProjects, setDisplayedProjects] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const initialRenderRef = useRef(true);
  const { theme, setTheme } = useTheme();

  // To handle hydration error on load.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hook to reset expanded project when search term, sort, or selected hackathon changes
  useEffect(() => {
    setExpandedProjectId(null);
  }, [searchTerm, sortBy, selectedHackathon]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const hackathonCollections = [
          { name: "Brainrot Hackathon", collection: "brainrot_winners" },
          { name: "Nosu AI Hackathon", collection: "nosu_ai_winners" },
        ];

        const projectPromises = hackathonCollections.map(async (hackathon) => {
          const projectsCollection = collection(db, hackathon.collection);
          const projectSnapshot = await getDocs(projectsCollection);
          return projectSnapshot.docs.map((doc) => ({
            id: doc.id,
            hackathon_name: hackathon.name,
            ...doc.data(),
          }));
        });

        const projectLists = await Promise.all(projectPromises);
        const projectList = projectLists.flat();

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
    // First, filter by hackathon selected
    .filter((project) => {
      if (selectedHackathon === "Brainrot Hackathon") {
        return project.hackathon_name === "Brainrot Hackathon";
      } else if (selectedHackathon === "Nosu AI Hackathon") {
        return project.hackathon_name === "Nosu AI Hackathon";
      } else if (selectedHackathon === "All") {
        return true;
      }
    })
    // then, filter by search term
    .filter((project) => {
      if (!searchTerm) return true; // Show all if no search term
      const searchTerms = searchTerm.toLowerCase().split(/\s+/);

      // Check if ALL search terms are found across ANY field
      return searchTerms.every(
        (term) =>
          (project.features &&
            project.features.some((feature) =>
              feature.toLowerCase().includes(term)
            )) ||
          (project.inspiration_text &&
            project.inspiration_text.toLowerCase().includes(term)) ||
          (project.log_line && project.log_line.toLowerCase().includes(term)) ||
          (project.what_it_does_text &&
            project.what_it_does_text.toLowerCase().includes(term)) ||
          (project.project_name &&
            project.project_name.toLowerCase().includes(term))
      );
    })
    // Then, filter by selected categories
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

        // First, compare by date
        const dateComparison = dateB - dateA;

        // If dates are the same, sort alphabetically
        if (dateComparison === 0) {
          return a.project_name
            .toLowerCase()
            .localeCompare(b.project_name.toLowerCase());
        }

        return dateComparison;
      }
      return a.project_name
        .toLowerCase()
        .localeCompare(b.project_name.toLowerCase());
    });

  // Function to load more projects as user scrolls
  const loadMoreProjects = useCallback(() => {
    const nextPageSize = pageSize + 10;
    const nextProjects = filteredProjects.slice(0, nextPageSize);
    setDisplayedProjects(nextProjects);
    setPageSize(nextPageSize);
    setHasMore(nextPageSize < filteredProjects.length);
  }, [filteredProjects, pageSize]);

  // Function to observe the last project element that was rendered
  const lastProjectElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProjects();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, loadMoreProjects]
  );

  // useEffect to reset pagination when filters change
  useEffect(() => {
    // Reset page size and displayed projects when filters change
    setPageSize(20);
    const initialProjects = filteredProjects.slice(0, 20);
    setDisplayedProjects(initialProjects);
    setHasMore(filteredProjects.length > 20);
  }, [activeFilters, searchTerm, sortBy, selectedHackathon]); // Add any other filter-related dependencies

  // Use useEffect to manage initial project display
  useEffect(() => {
    if (initialRenderRef.current && !isLoading) {
      const initialProjects = filteredProjects.slice(0, 20);
      setDisplayedProjects(initialProjects);
      setPageSize(20);
      setHasMore(filteredProjects.length > 20);
      initialRenderRef.current = false;
    }
  }, [filteredProjects, isLoading]);

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

  // Else, show the list of projects
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 dark:text-stone-200">
        <div className="grid gap-4 md:grid-cols-[90fr_90fr_90fr_1fr]">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Search
            </label>
            <Input
              placeholder="Enter to search (clear to reset)"
              value={searchInput}
              onChange={(e) => {
                const inputValue = e.target.value;
                setSearchInput(inputValue);
                if (inputValue === "") {
                  setSearchTerm("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchTerm(searchInput);
                }
              }}
              className="w-full bg-neutral-100 dark:bg-neutral-900 "
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Order by
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-neutral-100 dark:bg-neutral-900">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="w-full bg-neutral-100 dark:bg-neutral-900">
                <SelectItem value="default">Alphabetical (Default)</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Hackathon
            </label>
            <Select
              value={selectedHackathon}
              onValueChange={setSelectedHackathon}
            >
              <SelectTrigger className="w-full bg-neutral-100 dark:bg-neutral-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full bg-neutral-100 dark:bg-neutral-900">
                <SelectItem value="Nosu AI Hackathon">
                  Nosu AI Hackathon
                </SelectItem>
                <SelectItem value="Brainrot Hackathon">
                  Brainrot Hackathon
                </SelectItem>
                <SelectItem value="All">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end space-x-4 w-full">
            <Button
              variant="ghost"
              className="space-x-2 w-28 border bg-neutral-100 dark:hover:text-stone-200 dark:hover:bg-neutral-900 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 "
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
                (theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                ))}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {filteredProjects.length} result
            {filteredProjects.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="space-y-4">
          {displayedProjects.map((project, index) => (
            <div
              key={project.id}
              ref={
                index === displayedProjects.length - 1
                  ? lastProjectElementRef
                  : null
              }
            >
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
            </div>
          ))}
        </div>
        {!hasMore && (
          <div className="text-center text-gray-500 mt-4">End of Results</div>
        )}

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={(filters) => {
            setActiveFilters(filters);
            setExpandedProjectId(null);
          }}
          initialFilters={activeFilters}
        />
      </div>
    </>
  );
}
