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
  "Social Good",
  "Machine Learning/AI",
  "Education",
  "Low Code/No Code",
  "Web",
  "Blockchain",
  "Productivity",
  "Gaming",
  "Fintech",
  "Mobile",
  "Health",
  "AR/VR",
  "IoT",
  "DevOps",
  "Cybersecurity",
  "Lifehacks",
  "E-commerce/Retail",
  "Language/Translation",
  "Music/Art",
  "COVID-19",
  "Robotics",
  "Quantum",
  "Sustainability",
  "Sports/Fitness",
  "Agriculture",
  "Accessibility",
  "Data Visualization",
  "Space",
  "Supply Chain/Logistics",
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
