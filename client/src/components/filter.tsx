import React from 'react';
import { Category } from '@shared/schema';
import { Slider } from "@/components/ui/slider";

interface FilterProps {
    selectedCategories?: string[];
    onCategoryChange?: (categoryIds: string[]) => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    minPrice: number;
    maxPrice: number;
    categories: Category[];
    categoriesLoading?: boolean;
    productCounts?: Record<string, number>;
}

const Filters = ({
    selectedCategories,
    onCategoryChange,
    priceRange,
    onPriceChange,
    minPrice,
    maxPrice,
    categories,
    categoriesLoading = false,
    productCounts = {},
}: FilterProps) => {

    const handleCategoryToggle = (categoryId: string) => {
        if (!selectedCategories || !onCategoryChange) return;
        if (selectedCategories.includes(categoryId)) {
            onCategoryChange(selectedCategories.filter(id => id !== categoryId));
        } else {
            onCategoryChange([...selectedCategories, categoryId]);
        }
    };

    return (
        <div className="bg-card w-full p-5 md:p-6 border border-border/40 rounded-2xl flex flex-col gap-6 shadow-sm">
            <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Filters</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Refine your search results</p>
            </div>

            {/* Category Section */}
            {selectedCategories && onCategoryChange && (
                <div className="border-t border-border/40 pt-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Category</h3>
                    {categoriesLoading ? (
                        <p className="text-xs text-muted-foreground">Loading categories...</p>
                    ) : categories.length > 0 ? (
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                            {categories.map((category: Category) => {
                                const count = productCounts[category.id] || 0;
                                return (
                                    <label key={category.id} className="flex items-center gap-2.5 cursor-pointer py-0.5 group">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => handleCategoryToggle(category.id)}
                                            className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary"
                                        />
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {category.name} <span className="text-[10px] text-muted-foreground/60">({count})</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">No categories available</p>
                    )}
                </div>
            )}

            {/* Price Range Section */}
            <div className="border-t border-border/40 pt-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Price Range</h3>
                    <span className="text-xs font-semibold text-primary">
                        KES {priceRange[0]} - KES {priceRange[1]}
                    </span>
                </div>
                <div className="px-1 py-2">
                    <Slider
                        min={minPrice}
                        max={maxPrice}
                        step={Math.max(1, Math.round((maxPrice - minPrice) / 100))}
                        value={priceRange}
                        onValueChange={(val) => onPriceChange(val as [number, number])}
                        className="my-4"
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>KES {minPrice}</span>
                    <span>KES {maxPrice}</span>
                </div>
            </div>
        </div>
    );
};

export default Filters;