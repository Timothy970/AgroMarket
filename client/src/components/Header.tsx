import { ShoppingCart, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "./ThemeToggle";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { set } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  cartCount?: number;
  showSearch?: boolean;
}

export default function Header({ cartCount = 0, showSearch = true }: HeaderProps) {
  const { user } = useAuthStore();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                A
              </div>
              <span className="font-display font-bold text-xl hidden sm:inline">
                AgroMarket
              </span>
            </div>
          </Link>

          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search fresh produce..."
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -bottom-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {user ? (
              <Button
                variant="ghost"
                size="default"
                className="hidden md:inline-flex"
                onClick={() => {
                  logout();
                  toast({
                    title: "Success",
                    description: "You have been logged out.",
                  });
                  setTimeout(() => {
                    setLocation("/");
                  }, 500);
                }}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
