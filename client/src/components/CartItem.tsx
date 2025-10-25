import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  id: string;
  image: string;
  name: string;
  mode: "small" | "bulk";
  price: number;
  unit: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({
  image,
  name,
  mode,
  price,
  unit,
  quantity,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const subtotal = price * quantity;

  return (
    <div className="flex gap-4 pb-4 border-b" data-testid={`cart-item-${name}`}>
      <img
        src={image}
        alt={name}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-1" data-testid={`text-item-name-${name}`}>
              {name}
            </h3>
            <Badge 
              variant={mode === "bulk" ? "default" : "secondary"} 
              className="mt-1 text-xs"
              data-testid={`badge-mode-${mode}`}
            >
              {mode === "bulk" ? "Bulk" : "Small"} Purchase
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={() => {
              onRemove();
              console.log(`Removed ${name} from cart`);
            }}
            data-testid={`button-remove-${name}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (quantity > 1) {
                  onQuantityChange(quantity - 1);
                  console.log(`Decreased quantity for ${name}`);
                }
              }}
              disabled={quantity <= 1}
              data-testid={`button-decrease-${name}`}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                onQuantityChange(Math.max(1, val));
              }}
              className="w-16 h-8 text-center"
              data-testid={`input-quantity-${name}`}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                onQuantityChange(quantity + 1);
                console.log(`Increased quantity for ${name}`);
              }}
              data-testid={`button-increase-${name}`}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground">
              KES {price.toLocaleString()} × {quantity}
            </div>
            <div className="font-semibold" data-testid={`text-subtotal-${name}`}>
              KES {subtotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
