import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, ShoppingCart, MessageCircle, Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import PurchaseModeToggle, { PurchaseMode } from "@/components/PurchaseModeToggle";
import { Link } from "wouter";
import tomatoesImg from "@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png";

export default function ProductDetail() {
  const [mode, setMode] = useState<PurchaseMode>("small");
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: "1",
    name: "Organic Tomatoes",
    images: [tomatoesImg, tomatoesImg, tomatoesImg],
    seller: "John's Farm",
    location: "Nairobi, Kenya",
    rating: 4.8,
    reviews: 124,
    smallPrice: 200,
    smallUnit: "kg",
    bulkPrice: 4500,
    bulkUnit: "25kg sack",
    minBulkQuantity: 5,
    description: "Fresh organic tomatoes grown with care. Perfect for salads, cooking, and everyday use. Harvested daily to ensure maximum freshness and quality.",
    available: 500,
    harvestDate: "2024-10-20",
  };

  const currentPrice = mode === "small" ? product.smallPrice : product.bulkPrice;
  const currentUnit = mode === "small" ? product.smallUnit : product.bulkUnit;
  const subtotal = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header cartCount={2} />

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
              {product.images.slice(1).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover-elevate">
                  <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
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
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="mt-3 p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {product.seller.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{product.seller}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {product.location}
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
                smallPrice={product.smallPrice}
                smallUnit={product.smallUnit}
                bulkPrice={product.bulkPrice}
                bulkUnit={product.bulkUnit}
              />
            </div>

            {mode === "bulk" && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm">
                  <span className="font-semibold">Minimum order:</span> {product.minBulkQuantity} {product.bulkUnit}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  data-testid="button-contact-seller"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller for Negotiation
                </Button>
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
                <span className="font-semibold">KES {currentPrice.toLocaleString()}</span>
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
              onClick={() => console.log('Added to cart:', { product: product.name, mode, quantity, subtotal })}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
              <div>
                <div className="text-sm text-muted-foreground">Available</div>
                <div className="font-semibold">{product.available} kg</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Harvest Date</div>
                <div className="font-semibold">{product.harvestDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav cartCount={2} />
    </div>
  );
}
