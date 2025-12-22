import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/footer";
import ProductCard from "@/components/ProductCard";
import Filter from "@/components/filter";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cartApi, productsApi } from "@/lib/api";
import SharedPagination, { PaginationMeta } from "@/components/SharedPagination";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function CategoryPage() {
    const [location, setLocation] = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const { user, token, isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const itemsPerPage = 10;

    const { data: cartResponse } = useQuery({
        queryKey: ['cart'],
        queryFn: () => cartApi.getItems(token!),
        enabled: isAuthenticated,
    });
    const cartCount = cartResponse?.data?.items?.length || 0;

    const { data: productResponse, isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.getAll(),
    });

    const allProducts = productResponse?.data || [];

    // Client-side pagination logic
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = allProducts.slice(startIndex, endIndex);

    const pagination: PaginationMeta = {
        page: currentPage,
        size: itemsPerPage,
        total_items: totalItems,
        total_pages: totalPages,
        has_prev: currentPage > 1,
        has_next: currentPage < totalPages,
    };

    const addToCartHandler = async (productId: string) => {
        // Implement add to cart functionality here
        //must be logged in to add to cart
        if (!isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
            });
            // setLocation("/login");
            return;
        }
        const response = await cartApi.addItem({ productId, quantity: 1, purchaseMode: 'small' }, token!);
        console.log("Added to cart:", response);
        if (response.status_code !== 200) {
            toast({
                title: "Error",
                description: response?.message || "Failed to add product to cart.",
                variant: "destructive",
            });
            return;
        }
        //delete tansient cart after adding to authenticated user's cart
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast({
            title: "Success",
            description: `Product added to cart successfully.`,
        });
    };
    const handleProductClick = (productId: string) => {
        // Implement product click functionality here
        console.log(`Product ${productId} clicked`);
        setLocation(`/product/${productId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Optional: Scroll to top of product list
        document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header cartCount={cartCount} />
            {/* two div sections below, filter div on the left with 2/5 width, products div on the right with 3/5 width */}
            <div className="w-full mx-auto px-4 md:px-20 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
                    {/* Filter Section */}
                    <div className="md:col-span-1">
                        <Filter />
                    </div>
                    {/* Products Section */}
                    <div className="max-h-screen overflow-y-auto md:col-span-4 flex flex-col">
                        <section className="py-0 md:py-2 flex-1">
                            <div className="w-full mx-auto px-2">
                                <div id="products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {productsLoading ? (
                                        <p className="text-muted-foreground">Loading products...</p>
                                    ) : currentProducts && currentProducts.length > 0 ? (
                                        currentProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} onAddToCart={addToCartHandler} onClick={handleProductClick} />
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No products available</p>
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