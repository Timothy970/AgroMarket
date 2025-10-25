import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  seller: string;
  location: string;
  smallPrice: number;
  smallUnit: string;
  bulkPrice?: number;
  bulkUnit?: string;
  approved: boolean;
  onAddToCart?: () => void;
}

export default function ProductCard({
  image,
  name,
  seller,
  location,
  smallPrice,
  smallUnit,
  bulkPrice,
  bulkUnit,
  approved,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-shadow cursor-pointer">
      <div className="relative aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          data-testid={`img-product-${name}`}
        />
        {approved && (
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
            {name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {seller.charAt(0)}
            </div>
            <span className="line-clamp-1">{seller}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground" data-testid={`text-price-small-${name}`}>
              KES {smallPrice.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">per {smallUnit}</span>
          </div>
          
          {bulkPrice && bulkUnit && (
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Bulk:</span>
              <span className="text-base font-semibold text-foreground" data-testid={`text-price-bulk-${name}`}>
                KES {bulkPrice.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">per {bulkUnit}</span>
            </div>
          )}
        </div>

        <Button 
          className="w-full" 
          size="default"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
            console.log(`Added ${name} to cart`);
          }}
          data-testid={`button-add-cart-${name}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
