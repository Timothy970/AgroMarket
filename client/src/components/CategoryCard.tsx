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
      className="relative overflow-hidden group border border-border/40 bg-card/60 backdrop-blur-md p-3 sm:p-4 hover:border-primary/45 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer rounded-2xl flex flex-col gap-3 h-full"
      onClick={onClick}
      data-testid={`button-category-${name.toLowerCase()}`}
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex items-center justify-center p-3 sm:p-5">
        <img 
          src={icon} 
          alt={name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 ease-out filter drop-shadow-md" 
        />
        {count !== undefined && (
          <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            {count}
          </span>
        )}
      </div>
      <div className="flex flex-col items-center text-center px-1">
        <h3 className="font-semibold text-sm sm:text-base tracking-tight text-foreground group-hover:text-primary transition-colors duration-200" data-testid={`text-category-${name.toLowerCase()}`}>
          {name}
        </h3>
        {count !== undefined && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium">{count} products</p>
        )}
      </div>
    </Card>
  );
}
