"use client"

import * as React from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectFilterProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onSelectionChange: (selectedValues: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  selectAllText?: string
  clearAllText?: string
  maxHeight?: number
  className?: string
  disabled?: boolean
}

export const MultiSelectFilter = React.forwardRef<
  HTMLButtonElement,
  MultiSelectFilterProps
>(
  (
    {
      options,
      selectedValues,
      onSelectionChange,
      placeholder = "Select options...",
      searchPlaceholder = "Search options...",
      emptyMessage = "No options found",
      selectAllText = "Select All",
      clearAllText = "Clear All",
      maxHeight = 200,
      className,
      disabled = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [options, searchTerm])

    // Check if all visible options are selected
    const allSelected = React.useMemo(() => {
      const visibleValues = filteredOptions.map((option) => option.value)
      return visibleValues.length > 0 && visibleValues.every((value) => selectedValues.includes(value))
    }, [filteredOptions, selectedValues])

    const handleSelectAll = () => {
      const visibleValues = filteredOptions.map((option) => option.value)
      const newSelection = allSelected
        ? selectedValues.filter((value) => !visibleValues.includes(value))
        : [...new Set([...selectedValues, ...visibleValues])]
      onSelectionChange(newSelection)
    }

    const handleClearAll = () => {
      onSelectionChange([])
    }

    const handleOptionToggle = (value: string) => {
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
      onSelectionChange(newSelection)
    }

    const handleRemoveSelected = (value: string) => {
      onSelectionChange(selectedValues.filter((v) => v !== value))
    }

    const getSelectedLabels = () => {
      return selectedValues
        .map((value) => options.find((option) => option.value === value)?.label)
        .filter(Boolean)
    }

    const selectedLabels = getSelectedLabels()

    return (
      <div className={cn("w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between text-left font-normal",
                !selectedValues.length && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                {selectedLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedLabels.slice(0, 2).map((label, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                      >
                        {label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            const value = options.find((opt) => opt.label === label)?.value
                            if (value) handleRemoveSelected(value)
                          }}
                          className="hover:bg-primary/20 rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {selectedLabels.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{selectedLabels.length - 2} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span>{placeholder}</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white" align="start">
            <div className="flex flex-col">
              {/* Search Input */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Select All / Clear All Actions */}
              <div className="flex justify-between items-center p-2 border-b bg-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 px-2 text-xs"
                  disabled={filteredOptions.length === 0}
                >
                  <Checkbox
                    checked={allSelected}
                    className="mr-2 h-3 w-3"
                    disabled={filteredOptions.length === 0}
                  />
                  {selectAllText}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  disabled={selectedValues.length === 0}
                >
                  {clearAllText}
                </Button>
              </div>

              {/* Options List */}
              <div 
                className="overflow-y-auto"
                style={{ maxHeight: `${maxHeight}px` }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                          option.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => !option.disabled && handleOptionToggle(option.value)}
                      >
                        <Checkbox
                          checked={selectedValues.includes(option.value)}
                          disabled={option.disabled}
                          className="h-4 w-4"
                        />
                        <span className="flex-1">{option.label}</span>
                        {selectedValues.includes(option.value) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

MultiSelectFilter.displayName = "MultiSelectFilter"
