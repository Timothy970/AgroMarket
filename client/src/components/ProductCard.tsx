import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, ShoppingCart } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onClick?: (productId: string) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onClick,
}: ProductCardProps) {
  return (
    <Card
      onClick={() => onClick?.(product.id)}
      className="overflow-hidden hover-elevate active-elevate-2 transition-shadow cursor-pointer">
      <div className="relative aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          data-testid={`img-product-${product.name}`}
        />
        {product.status.toLocaleLowerCase() === "approved" && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-product-name-${name}`}>
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {product.sellerId.charAt(0)}
            </div>
            <span className="line-clamp-1">{product.sellerId}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{product.location}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground" data-testid={`text-price-small-${product.name}`}>
              KES {product.smallPrice.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">per {product.smallUnit}</span>
          </div>

          {product.bulkUnit && (
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Bulk:</span>
              {product.bulkPrice ? (
                <>
                  <span className="text-base font-semibold text-foreground" data-testid={`text-price-bulk-${product.name}`}>
                    KES {product.bulkPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">per {product.bulkUnit}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Not available</span>
              )}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          size="default"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product.id);
            console.log(`Added ${product.name} to cart`);
          }}
          data-testid={`button-add-cart-${product.name}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
