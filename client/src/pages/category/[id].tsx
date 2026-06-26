import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/footer";
import ProductCard from "@/components/ProductCard";
import Filter from "@/components/filter";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { productsApi, cartApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";

export default function CategoryPage() {
    const [location, setLocation] = useLocation();
    const { toast } = useToast();
    const { token, isAuthenticated } = useAuthStore();
    const [match, params] = useRoute("/category/:id");
    const categoryId = match ? params.id : null;

    const { data: cartResponse } = useQuery({
        queryKey: ['cart'],
        queryFn: () => cartApi.getItems(token!),
        enabled: isAuthenticated,
    });
    const cartCount = cartResponse?.data?.items?.length || 0;

    const { data: categoryProductsResponse, isLoading: categoryProductsLoading } = useQuery({
        queryKey: ['products', 'category', categoryId],
        queryFn: () => productsApi.getAll({ category: categoryId ?? undefined, status: 'approved' }),
        enabled: !!categoryId,
    });

    const categoryProducts = categoryProductsResponse?.data || [];

    // Price Filter States
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [hasInitializedPrices, setHasInitializedPrices] = useState(false);

    // Compute range bounds based on actual product smallPrice
    const prices = useMemo(() => categoryProducts.map(p => Number(p.smallPrice)), [categoryProducts]);
    const minPrice = useMemo(() => prices.length > 0 ? Math.min(...prices) : 0, [prices]);
    const maxPrice = useMemo(() => prices.length > 0 ? Math.max(...prices) : 10000, [prices]);

    // Reset range bounds initialization when switching categories
    useEffect(() => {
        setHasInitializedPrices(false);
    }, [categoryId]);

    // Reactively initialize prices range state once categories products load
    useEffect(() => {
        if (categoryProducts.length > 0 && !hasInitializedPrices) {
            setPriceRange([minPrice, maxPrice]);
            setHasInitializedPrices(true);
        }
    }, [categoryProducts, hasInitializedPrices, minPrice, maxPrice]);

    // Filter products locally on price
    const filteredProducts = useMemo(() => {
        return categoryProducts.filter(product => {
            const price = Number(product.smallPrice);
            return price >= priceRange[0] && price <= priceRange[1];
        });
    }, [categoryProducts, priceRange]);

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

    return (
        <div className="min-h-screen bg-background">
            <Header cartCount={cartCount} />
            <div className="w-full mx-auto px-4 md:px-20 py-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full items-start">
                    {/* Filter Section */}
                    <div className="md:col-span-1 md:sticky md:top-20">
                        <Filter
                            priceRange={priceRange}
                            onPriceChange={setPriceRange}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            categories={[]}
                        />
                    </div>
                    {/* Products Section */}
                    <div className="md:col-span-4">
                        <section className="py-0">
                            <div className="w-full mx-auto px-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {categoryProductsLoading ? (
                                        <p className="text-muted-foreground">Loading products...</p>
                                    ) : filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} onAddToCart={addToCartHandler} onClick={handleProductClick} />
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No products available in this price range</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
            <MobileNav cartCount={cartCount} />
        </div>
    );
}