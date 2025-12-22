import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

export type PurchaseMode = "small" | "bulk";

interface PurchaseModeToggleProps {
  mode: PurchaseMode;
  onModeChange: (mode: PurchaseMode) => void;
  smallPrice: number;
  smallUnit: string;
  bulkPrice: number | null;
  bulkUnit: string;
}

export default function PurchaseModeToggle({
  mode,
  onModeChange,
  smallPrice,
  smallUnit,
  bulkPrice,
  bulkUnit,
}: PurchaseModeToggleProps) {
  return (
    <RadioGroup
      value={mode}
      onValueChange={(value) => {
        onModeChange(value as PurchaseMode);
        console.log(`Purchase mode changed to: ${value}`);
      }}
      className="grid gap-4"
    >
      <div
        className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${mode === "small" ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        onClick={() => onModeChange("small")}
        data-testid="button-mode-small"
      >
        <div className="flex items-start gap-3">
          <RadioGroupItem value="small" id="small" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="small" className="font-semibold text-base cursor-pointer">
              Small Purchase
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              KES {smallPrice.toLocaleString()} per {smallUnit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Perfect for individual consumers and small buyers
            </p>
          </div>
          {mode === "small" && (
            <Check className="w-5 h-5 text-primary" />
          )}
        </div>
      </div>

      <div
        className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${mode === "bulk" ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        onClick={() => onModeChange("bulk")}
        data-testid="button-mode-bulk"
      >
        <div className="flex items-start gap-3">
          <RadioGroupItem value="bulk" id="bulk" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="bulk" className="font-semibold text-base cursor-pointer">
              Bulk Purchase
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              KES {bulkPrice ? bulkPrice.toLocaleString() : ""} per {bulkUnit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              For wholesalers and large orders with tiered pricing
            </p>
          </div>
          {mode === "bulk" && (
            <Check className="w-5 h-5 text-primary" />
          )}
        </div>
      </div>
    </RadioGroup>
  );
}
