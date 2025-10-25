import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingBag, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

export default function SellerDashboard() {
  const stats = [
    { label: "Total Earnings", value: "KES 45,600", icon: DollarSign, color: "text-primary" },
    { label: "Pending Orders", value: "12", icon: Clock, color: "text-chart-2" },
    { label: "Active Products", value: "8", icon: Package, color: "text-chart-4" },
    { label: "Total Sales", value: "156", icon: ShoppingBag, color: "text-chart-1" },
  ];

  const products = [
    {
      id: "1",
      name: "Organic Tomatoes",
      status: "approved" as const,
      price: 200,
      stock: 500,
    },
    {
      id: "2",
      name: "Fresh Lettuce",
      status: "pending" as const,
      price: 150,
      stock: 300,
    },
    {
      id: "3",
      name: "Sweet Mangoes",
      status: "rejected" as const,
      price: 180,
      stock: 0,
      feedback: "Images need to be clearer. Please provide high-quality product photos.",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: { variant: "default" as const, icon: CheckCircle2, label: "Approved" },
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
    };
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header cartCount={0} showSearch={false} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl" data-testid="text-page-title">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back, John's Farm</p>
          </div>
          <Button data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-2xl">My Products</h2>
            <Button variant="outline" data-testid="button-manage-products">
              Manage All
            </Button>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg" data-testid={`product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Price: KES {product.price}/kg</span>
                      <span>Stock: {product.stock} kg</span>
                    </div>
                    {product.feedback && (
                      <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive-foreground">
                          <span className="font-semibold">Feedback:</span> {product.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid={`button-edit-${product.id}`}>
                      Edit
                    </Button>
                    {product.status === "approved" && (
                      <Button variant="ghost" size="sm" data-testid={`button-deactivate-${product.id}`}>
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <MobileNav cartCount={0} />
    </div>
  );
}
