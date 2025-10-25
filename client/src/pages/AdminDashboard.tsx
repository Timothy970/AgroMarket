import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Users, Clock, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import tomatoesImg from "@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png";
import lettuceImg from "@assets/generated_images/Sample_product_lettuce_e8e9e93a.png";

export default function AdminDashboard() {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const stats = [
    { label: "Total Sales", value: "KES 1.2M", icon: DollarSign, color: "text-primary" },
    { label: "New Sellers", value: "24", icon: Users, color: "text-chart-1" },
    { label: "Pending Approvals", value: "8", icon: Clock, color: "text-chart-2" },
    { label: "Total Orders", value: "456", icon: ShoppingBag, color: "text-chart-4" },
  ];

  const pendingProducts = [
    {
      id: "1",
      name: "Organic Tomatoes",
      seller: "John's Farm",
      category: "Vegetables",
      smallPrice: 200,
      bulkPrice: 4500,
      submittedDate: "2024-10-22",
      images: [tomatoesImg],
      description: "Fresh organic tomatoes grown with care. Perfect for salads and cooking.",
      quantity: 500,
    },
    {
      id: "2",
      name: "Fresh Lettuce",
      seller: "Green Valley Farm",
      category: "Vegetables",
      smallPrice: 150,
      bulkPrice: 3200,
      submittedDate: "2024-10-23",
      images: [lettuceImg],
      description: "Crisp and fresh lettuce, harvested daily.",
      quantity: 300,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} showSearch={false} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl" data-testid="text-page-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage platform activities and approvals</p>
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
            <h2 className="font-display font-bold text-2xl">Pending Product Approvals</h2>
            <Badge variant="secondary" className="text-sm">
              {pendingProducts.length} pending
            </Badge>
          </div>

          <div className="space-y-4">
            {pendingProducts.map((product) => {
              const isExpanded = expandedProduct === product.id;
              
              return (
                <Card key={product.id} className="overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover-elevate"
                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1" data-testid={`product-name-${product.id}`}>
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span>By: {product.seller}</span>
                            <span>Category: {product.category}</span>
                            <span>Submitted: {product.submittedDate}</span>
                          </div>
                          <div className="flex gap-3 mt-2">
                            <Badge variant="secondary">Small: KES {product.smallPrice}/kg</Badge>
                            <Badge variant="secondary">Bulk: KES {product.bulkPrice}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Available Quantity:</span>
                              <span className="font-medium">{product.quantity} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Small Price:</span>
                              <span className="font-medium">KES {product.smallPrice}/kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bulk Price:</span>
                              <span className="font-medium">KES {product.bulkPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Approved product: ${product.name}`);
                          }}
                          data-testid={`button-approve-${product.id}`}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRejectDialogOpen(true);
                          }}
                          data-testid={`button-reject-${product.id}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent data-testid="dialog-reject">
          <DialogHeader>
            <DialogTitle>Reject Product Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">
                Reason for Rejection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Images need to be clearer. Please provide high-quality product photos."
                className="mt-1.5 min-h-32"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                data-testid="input-rejection-reason"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {rejectionReason.length} characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              data-testid="button-cancel-reject"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                console.log('Product rejected with reason:', rejectionReason);
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
              disabled={!rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
