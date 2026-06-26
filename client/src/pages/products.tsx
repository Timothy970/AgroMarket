import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/footer";
import ProductCard from "@/components/ProductCard";
import Filter from "@/components/filter";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cartApi, productsApi, categoriesApi } from "@/lib/api";
import SharedPagination, { PaginationMeta } from "@/components/SharedPagination";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function CategoryPage() {
    const [location, setLocation] = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const { token, isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const itemsPerPage = 10;

    const { data: cartResponse } = useQuery({
        queryKey: ['cart'],
        queryFn: () => cartApi.getItems(token!),
        enabled: isAuthenticated,
    });
    const cartCount = cartResponse?.data?.items?.length || 0;

    const [searchParam, setSearchParam] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get("search") || "";
    });

    useEffect(() => {
        const handleLocationChange = () => {
            const params = new URLSearchParams(window.location.search);
            setSearchParam(params.get("search") || "");
        };
        window.addEventListener("locationchange", handleLocationChange);
        return () => {
            window.removeEventListener("locationchange", handleLocationChange);
        };
    }, []);

    // Queries
    const { data: productResponse, isLoading: productsLoading } = useQuery({
        queryKey: ['products', searchParam],
        queryFn: () => productsApi.getAll({ search: searchParam, status: 'approved' }),
    });

    const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const allProducts = productResponse?.data || [];
    const categories = categoriesResponse?.data || [];

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [hasInitializedPrices, setHasInitializedPrices] = useState(false);

    // Compute cheapest and most expensive bounds
    const prices = useMemo(() => allProducts.map(p => Number(p.smallPrice)), [allProducts]);
    const minPrice = useMemo(() => prices.length > 0 ? Math.min(...prices) : 0, [prices]);
    const maxPrice = useMemo(() => prices.length > 0 ? Math.max(...prices) : 10000, [prices]);

    // Reset initialization when search parameters update
    useEffect(() => {
        setHasInitializedPrices(false);
    }, [searchParam]);

    // Reactively adjust price slider range to product bounds once loaded
    useEffect(() => {
        if (allProducts.length > 0 && !hasInitializedPrices) {
            setPriceRange([minPrice, maxPrice]);
            setHasInitializedPrices(true);
        }
    }, [allProducts, hasInitializedPrices, minPrice, maxPrice]);

    // Count products per category dynamically
    const productCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allProducts.forEach(p => {
            counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
        });
        return counts;
    }, [allProducts]);

    // Perform actual filter logic on client side
    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            // Category check
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.categoryId);
            // Price check
            const price = Number(product.smallPrice);
            const priceMatch = price >= priceRange[0] && price <= priceRange[1];
            return categoryMatch && priceMatch;
        });
    }, [allProducts, selectedCategories, priceRange]);

    // Client-side pagination logic
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const pagination: PaginationMeta = {
        page: currentPage,
        size: itemsPerPage,
        total_items: totalItems,
        total_pages: totalPages,
        has_prev: currentPage > 1,
        has_next: currentPage < totalPages,
    };

    const addToCartHandler = async (productId: string) => {
        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
            });
            return;
        }
        const response = await cartApi.addItem({ productId, quantity: 1, purchaseMode: 'small' }, token!);
        if (response.status_code !== 200) {
            toast({
                title: "Error",
                description: response?.message || "Failed to add product to cart.",
                variant: "destructive",
            });
            return;
        }
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast({
            title: "Success",
            description: `Product added to cart successfully.`,
        });
    };

    const handleProductClick = (productId: string) => {
        setLocation(`/product/${productId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header cartCount={cartCount} />
            <div className="w-full mx-auto px-4 md:px-20 py-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full items-start">
                    {/* Filter Section */}
                    <div className="md:col-span-1 md:sticky md:top-20">
                        <Filter
                            selectedCategories={selectedCategories}
                            onCategoryChange={setSelectedCategories}
                            priceRange={priceRange}
                            onPriceChange={setPriceRange}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            categories={categories}
                            categoriesLoading={categoriesLoading}
                            productCounts={productCounts}
                        />
                    </div>
                    {/* Products Section */}
                    <div className="md:col-span-4 flex flex-col">
                        <section className="py-0 flex-1">
                            <div className="w-full mx-auto px-2">
                                <div id="products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {productsLoading ? (
                                        <p className="text-muted-foreground">Loading products...</p>
                                    ) : currentProducts && currentProducts.length > 0 ? (
                                        currentProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} onAddToCart={addToCartHandler} onClick={handleProductClick} />
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No products found matching filters</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Pagination Section */}
                        {!productsLoading && totalItems > 0 && (
                            <div className="py-4 mt-auto w-full flex justify-center">
                                <SharedPagination
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
            <MobileNav cartCount={0} />
        </div>
    );
}