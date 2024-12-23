import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CATEGORIES = [
  "Accessibility",
  "Agriculture",
  "AR/VR",
  "Blockchain",
  "Cybersecurity",
  "Data Visualization",
  "DevOps",
  "E-commerce/Retail",
  "Education",
  "Fintech",
  "Gaming",
  "Health",
  "IoT",
  "Jobs/Career",
  "Language/Translation",
  "Lifehacks",
  "Low Code/No Code",
  "Machine Learning/AI",
  "Medicine",
  "Mobile",
  "Music/Art",
  "Productivity",
  "Quantum",
  "Robotics",
  "Social Good",
  "Space",
  "Sports/Fitness",
  "Supply Chain/Logistics",
  "Sustainability",
  "Web",
];

export function FilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
}) {
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  // Reset selectedFilters when modal opens to ensure clean state
  useEffect(() => {
    if (isOpen) {
      setSelectedFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleFilterChange = (category) => {
    setSelectedFilters((prev) =>
      prev.includes(category)
        ? prev.filter((f) => f !== category)
        : [...prev, category]
    );
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter by Category</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedFilters.includes(category)}
                onCheckedChange={() => handleFilterChange(category)}
              />
              <label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={handleApply}
            className="dark:text-stone-300 dark:hover:bg-stone-700 dark:bg-stone-800"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
