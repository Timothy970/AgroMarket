import React from "react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/footer";
import ProductCard from "@/components/ProductCard";
import Filter from "@/components/filter";
import { categoryProducts } from "@/data/data";
export default function CategoryPage() {
    const addToCartHandler = (productId: string) => {
        // Implement add to cart functionality here
        console.log(`Product ${productId} added to cart`);
    };
    return (
        <div className="min-h-screen bg-background">
            <Header cartCount={0} />
            {/* two div sections below, filter div on the left with 2/5 width, products div on the right with 3/5 width */}
            <div className="w-full mx-auto px-4 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                    {/* Filter Section */}
                    <div className="md:col-span-1">
                        <Filter />
                    </div>
                    {/* Products Section */}
                    <div className="max-h-screen overflow-y-auto md:col-span-6">
                        <section className="py-0 md:py-2">
                            <div className="w-full mx-auto px-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {categoryProducts.map((product) => (
                                        <ProductCard key={product.id} {...product} onAddToCart={addToCartHandler} />
                                    ))}
                                </div>
                            </div>

                        </section>
                    </div>
                </div>
            </div>
            <Footer />
            <MobileNav cartCount={0} />
        </div>
    );
}