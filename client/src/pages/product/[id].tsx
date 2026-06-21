import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, ShoppingCart, MessageCircle, Minus, Plus, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import PurchaseModeToggle, { PurchaseMode } from "@/components/PurchaseModeToggle";
import { Link, useRoute } from "wouter";
import Footer from "@/components/footer";
import ProductCard from "@/components/ProductCard";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, cartApi } from "@/lib/api";
import { Product } from "@shared/schema";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
    const [location, setLocation] = useLocation();
    const [mode, setMode] = useState<PurchaseMode>("small");
    const [quantity, setQuantity] = useState(1);
    const [match, params] = useRoute("/product/:id");
    const productId = match ? params.id : null;

    const { token, isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: cartResponse } = useQuery({
        queryKey: ['cart'],
        queryFn: () => cartApi.getItems(token!),
        enabled: isAuthenticated,
    });
    const cartCount = cartResponse?.data?.items?.length || 0;

    const { data: productResponse, isLoading: productLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsApi.getById(productId!),
        enabled: !!productId,
    });
    const product = productResponse?.data || null;
    const { data: featuredProductsResponse, isLoading: featuredProductsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.getAll(),
    });
    const featuredProducts = featuredProductsResponse?.data || [];

    // Add to cart mutation
    const addToCartMutation = useMutation({
        mutationFn: async () => {
            if (!isAuthenticated) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to add items to your cart.",
                    variant: "destructive",
                });
                setLocation("/login");
                return;
            }
            return cartApi.addItem({
                productId: product!.id,
                quantity,
                purchaseMode: mode,
            }, token!);
        },
        onSuccess: (response) => {
            if (!response) return;
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
                description: `${product?.name} added to cart successfully.`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to add product to cart.",
                variant: "destructive",
            });
        }
    });

    if (productLoading) {
        return (
            <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col justify-between">
                <Header cartCount={cartCount} />
                <div className="flex-1 flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Loading product details...</p>
                </div>
                <Footer />
                <MobileNav cartCount={cartCount} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col justify-between">
                <Header cartCount={cartCount} />
                <div className="flex-1 flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Product not found</p>
                </div>
                <Footer />
                <MobileNav cartCount={cartCount} />
            </div>
        );
    }

    const currentPrice = mode === "small" ? product.smallPrice : product.bulkPrice;
    const currentUnit = mode === "small" ? product.smallUnit : product.bulkUnit;
    const subtotal = currentPrice ? Number(currentPrice) * quantity : 0;

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Header cartCount={cartCount} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Button>
                </Link>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-4">
                        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                data-testid="img-product-main"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {product.images.slice(1).map((img) => (
                                <div key={img + product.id} className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover-elevate">
                                    <img src={img} alt={`${product.name} ${product.id}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h1 className="font-display font-bold text-3xl md:text-4xl" data-testid="text-product-name">
                                    {product.name}
                                </h1>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                                    Verified
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-primary text-primary" />
                                    <span className="font-semibold">4.8</span>
                                    <span className="text-muted-foreground">(7 reviews)</span>
                                </div>
                            </div>

                            <div className="mt-3 p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                        {product.sellerId.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Farmer ID: {product.sellerId.slice(0, 8)}</div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            {product.location || "Nairobi, Kenya"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Select Purchase Mode</h3>
                            <PurchaseModeToggle
                                mode={mode}
                                onModeChange={setMode}
                                smallPrice={Number(product.smallPrice)}
                                smallUnit={product.smallUnit}
                                bulkPrice={product.bulkPrice ? Number(product.bulkPrice) : null}
                                bulkUnit={product.bulkUnit || ""}
                            />
                        </div>

                        {mode === "bulk" && (
                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                <p className="text-sm">
                                    <span className="font-semibold">Minimum order:</span> {product.minBulkQuantity} {product.bulkUnit}
                                </p>
                                <Link href={`/chat?userId=${product.sellerId}&name=Farmer%20${product.sellerId.slice(0, 8)}`}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 w-full"
                                        data-testid="button-contact-seller"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Contact Seller for Negotiation
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div>
                            <h3 className="font-semibold mb-3">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        data-testid="button-decrease-quantity"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 text-center"
                                        data-testid="input-quantity"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(quantity + 1)}
                                        data-testid="button-increase-quantity"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="text-muted-foreground">
                                    {currentUnit}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price per {currentUnit}</span>
                                <span className="font-semibold">KES {currentPrice ? Number(currentPrice).toLocaleString() : ""}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Quantity</span>
                                <span className="font-semibold">{quantity}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-xl" data-testid="text-total-price">
                                    KES {subtotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full"
                            onClick={() => addToCartMutation.mutate()}
                            disabled={addToCartMutation.isPending}
                            data-testid="button-add-to-cart"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                        </Button>

                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground">{product.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                            <div>
                                <div className="text-sm text-muted-foreground">Available</div>
                                <div className="font-semibold">{product.availableQuantity} kg</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Harvest Date</div>
                                <div className="font-semibold">
                                    {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Not specified"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-8xl mx-auto px-4 mt-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display font-bold text-2xl md:text-3xl">
                        Featured Products
                    </h2>
                    <Button variant="ghost" className="hidden md:inline-flex" data-testid="button-view-all">
                        View All

                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {featuredProducts.map((product: Product) => (
                        <ProductCard key={product.id} product={product} onClick={() => setLocation(`/product/${product.id}`)} />
                    ))}
                </div>
            </div>
            <Footer />
            <MobileNav cartCount={cartCount} />
        </div>
    );
}
