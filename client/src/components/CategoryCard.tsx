import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  icon: string;
  name: string;
  count?: number;
  onClick?: () => void;
}

export default function CategoryCard({ icon, name, count, onClick }: CategoryCardProps) {
  return (
    <Card
      className="p-6 flex flex-col items-center justify-center gap-3 hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={() => {
        onClick?.();
        console.log(`Navigating to ${name} category`);
      }}
      data-testid={`button-category-${name.toLowerCase()}`}
    >
      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
        <img src={icon} alt={name} className="w-10 h-10 object-contain" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-base" data-testid={`text-category-${name.toLowerCase()}`}>
          {name}
        </h3>
        {count !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">{count} items</p>
        )}
      </div>
    </Card>
  );
}
