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
import {
  DollarSign,
  Users,
  Clock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  CheckSquare,
  Settings,
  LogOut,
  ShieldCheck,
  Grid3x3,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Star,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, ordersApi, categoriesApi, payoutsApi } from "@/lib/api";
import { Category } from "@shared/schema";
import api from "@/lib/axios";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [, setLocation] = useLocation();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { user, token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  
  const queryClient = useQueryClient();

  const { data: pendingProductsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-pending-products'],
    queryFn: () => productsApi.getAll({ status: 'pending' }),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const pendingProducts = pendingProductsResponse?.data || [];

  const { data: ordersResponse } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: () => ordersApi.getAll(),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const allOrders = ordersResponse?.data || [];

  const { data: usersResponse } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => api.get('/api/admin/users').then(res => res.data),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const allUsers = usersResponse?.data || [];

  const { data: approvedProductsResponse, isLoading: approvedProductsLoading } = useQuery({
    queryKey: ['admin-approved-products'],
    queryFn: () => productsApi.getAll({ status: 'approved' }),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const approvedProducts = approvedProductsResponse?.data || [];

  const { data: payoutsResponse, isLoading: payoutsLoading } = useQuery({
    queryKey: ['admin-all-payouts'],
    queryFn: () => payoutsApi.getAdminPayouts(),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const allPayouts = payoutsResponse?.data || [];

  const [approvePayoutDialogOpen, setApprovePayoutDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [customPayoutAmount, setCustomPayoutAmount] = useState("");

  const approvePayoutMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      return payoutsApi.approvePayout(id, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-payouts'] });
      toast({
        title: "Payout Approved",
        description: "The custom payout amount has been approved.",
      });
      setApprovePayoutDialogOpen(false);
      setSelectedPayout(null);
      setCustomPayoutAmount("");
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to approve payout.",
        variant: "destructive",
      });
    }
  });

  const payPayoutMutation = useMutation({
    mutationFn: async (id: string) => {
      return payoutsApi.paySupplier(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-payouts'] });
      toast({
        title: "Payout Completed",
        description: "The payment has been sent to the supplier successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Payment Error",
        description: err.message || "Failed to process B2C payout.",
        variant: "destructive",
      });
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      return productsApi.toggleFeatured(id, isFeatured);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-approved-products'] });
      toast({
        title: variables.isFeatured ? "Featured" : "Unfeatured",
        description: `Product successfully ${variables.isFeatured ? "featured" : "removed from featured"}.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update featured status.",
        variant: "destructive",
      });
    }
  });

  // Categories management states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState<Category | null>(null);

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-all-categories'],
    queryFn: () => categoriesApi.getAll(),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const allCategories = categoriesResponse?.data || [];

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setCategoryImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", files[0]);

      const response = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status_code === 200) {
        setCategoryImageUrl(response.data.data.url);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: response.data.message || "Failed to upload image",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Error",
        description: err.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setCategoryImageUploading(false);
    }
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; imageUrl?: string }) => {
      return categoriesApi.create(data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Created",
        description: "New category created successfully.",
      });
      closeCategoryDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create category.",
        variant: "destructive",
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string; imageUrl?: string } }) => {
      return categoriesApi.update(id, data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Updated",
        description: "Category updated successfully.",
      });
      closeCategoryDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update category.",
        variant: "destructive",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return categoriesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Deleted",
        description: "Category deleted successfully.",
      });
      setDeleteCategoryDialogOpen(false);
      setSelectedCategoryToDelete(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete category.",
        variant: "destructive",
      });
    }
  });

  const openCreateCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryImageUrl("");
    setImageUrlInput("");
    setIsCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryImageUrl(category.imageUrl || "");
    setImageUrlInput(category.imageUrl || "");
    setIsCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryImageUrl("");
    setImageUrlInput("");
  };

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/admin/products/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      toast({
        title: "Approved",
        description: "Product approved successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to approve product",
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/api/admin/products/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      toast({
        title: "Rejected",
        description: "Product rejected successfully",
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProductId(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to reject product",
        variant: "destructive",
      });
    }
  });

  const totalSalesAmount = allOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const newSellersCount = allUsers.filter((u: any) => u.role === 'seller').length;

  const stats = [
    { label: "Total Sales", value: `KES ${totalSalesAmount.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "New Sellers", value: newSellersCount.toString(), icon: Users, color: "text-chart-1" },
    { label: "Pending Approvals", value: pendingProducts.length.toString(), icon: Clock, color: "text-chart-2" },
    { label: "Total Orders", value: allOrders.length.toString(), icon: ShoppingBag, color: "text-chart-4" },
  ];

  if (!isAuthenticated || user?.role !== "admin") {
    toast({
      title: "Access Denied",
      description: "You must be an admin to access the admin dashboard.",
      variant: "destructive",
    });
    setTimeout(() => {
      setLocation("/");
    }, 2000);
    return null;
  }


  const AdminSidebar = (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <div className="font-semibold">AgroMarket Admin</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "overview"}
                  onClick={() => setActiveView("overview")}
                >
                  <LayoutDashboard />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "approvals"}
                  onClick={() => setActiveView("approvals")}
                >
                  <CheckSquare />
                  <span>Approvals</span>
                  {pendingProducts.length > 0 && (
                    <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {pendingProducts.length}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "products"}
                  onClick={() => setActiveView("products")}
                >
                  <ShoppingBag />
                  <span>Products</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "users"}
                  onClick={() => setActiveView("users")}
                >
                  <Users />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "categories"}
                  onClick={() => setActiveView("categories")}
                >
                  <Grid3x3 />
                  <span>Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "payouts"}
                  onClick={() => setActiveView("payouts")}
                >
                  <DollarSign />
                  <span>Payouts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setLocation("/settings")}>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setLocation("/")}>
              <LogOut />
              <span>Back to Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );

  return (
    <DashboardLayout
      sidebar={AdminSidebar}
      breadcrumbs={[
        { label: "Admin Dashboard", href: "#" },
        { label: activeView.charAt(0).toUpperCase() + activeView.slice(1) },
      ]}
    >
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {activeView === "overview" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                );
              })}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Pending Approvals</h2>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("approvals")}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {productsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading pending products...</p>
                  ) : pendingProducts.length > 0 ? (
                    pendingProducts.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">Seller: {product.sellerId.slice(0, 8)}</div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending approvals</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeView === "approvals" && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Product Approvals</h1>
              <Badge variant="secondary">
                {pendingProducts.length} pending
              </Badge>
            </div>
            <div className="space-y-4">
              {productsLoading ? (
                <p className="text-muted-foreground">Loading pending crop requests...</p>
              ) : pendingProducts.length > 0 ? (
                pendingProducts.map((product) => {
                  const isExpanded = expandedProduct === product.id;
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div
                        className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1">
                                {product.name}
                              </h3>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span>Seller ID: {product.sellerId.slice(0, 8)}</span>
                                <span>Submitted: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
                              </div>
                              <div className="flex gap-3 mt-2">
                                <Badge variant="secondary">Small: KES {Number(product.smallPrice)}/{product.smallUnit}</Badge>
                                {product.bulkPrice && (
                                  <Badge variant="secondary">Bulk: KES {Number(product.bulkPrice)}/{product.bulkUnit}</Badge>
                                )}
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
                                  <span className="font-medium">{product.availableQuantity} kg</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Small Price:</span>
                                  <span className="font-medium">KES {Number(product.smallPrice)}/{product.smallUnit}</span>
                                </div>
                                {product.bulkPrice && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bulk Price:</span>
                                    <span className="font-medium">KES {Number(product.bulkPrice)}/{product.bulkUnit}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                approveMutation.mutate(product.id);
                              }}
                              disabled={approveMutation.isPending}
                            >
                              {approveMutation.isPending && approveMutation.variables === product.id ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProductId(product.id);
                                setRejectDialogOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })
              ) : (
                <p className="text-muted-foreground">No pending product approvals.</p>
              )}
            </div>
          </>
        )}

        {activeView === "users" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-4">Users</h1>
            {allUsers && allUsers.length > 0 ? (
              <div className="border rounded-lg overflow-hidden bg-card">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {allUsers.map((u: any) => (
                        <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">
                            {u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "N/A"}
                          </td>
                          <td className="p-4 align-middle">{u.email}</td>
                          <td className="p-4 align-middle">
                            <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'seller' ? 'default' : 'secondary'}>
                              {u.role.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No users registered</h3>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "categories" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                <p className="text-sm text-muted-foreground">Manage crop and product categories</p>
              </div>
              <Button onClick={openCreateCategoryDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {categoriesLoading ? (
              <p className="text-muted-foreground">Loading categories...</p>
            ) : allCategories && allCategories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allCategories.map((category: any) => (
                  <Card key={category.id} className="p-6 flex flex-col justify-between">
                    <div>
                      {category.imageUrl && (
                        <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-muted mb-4">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {category.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditCategoryDialog(category)}
                      >
                        <Edit className="w-4 h-4 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCategoryToDelete(category);
                          setDeleteCategoryDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <Grid3x3 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Get started by creating your first category</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "products" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Products Manager</h1>
                <p className="text-sm text-muted-foreground">Manage approved products and promote them to featured</p>
              </div>
            </div>

            {approvedProductsLoading ? (
              <p className="text-muted-foreground">Loading approved products...</p>
            ) : approvedProducts && approvedProducts.length > 0 ? (
              <div className="border rounded-lg overflow-hidden bg-card">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">Image</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stock</th>
                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[100px]">Featured</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {approvedProducts.map((product) => {
                        const isProductFeatured = product.isFeatured || false;
                        const categoryName = allCategories.find((c: any) => c.id === product.categoryId)?.name || "Unknown";
                        return (
                          <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </td>
                            <td className="p-4 align-middle font-medium">{product.name}</td>
                            <td className="p-4 align-middle">{categoryName}</td>
                            <td className="p-4 align-middle">
                              KES {Number(product.smallPrice)}/{product.smallUnit}
                            </td>
                            <td className="p-4 align-middle">{product.availableQuantity}</td>
                            <td className="p-4 align-middle text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-9 w-9 rounded-full ${
                                  isProductFeatured 
                                    ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10" 
                                    : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/5"
                                }`}
                                onClick={() => {
                                  toggleFeaturedMutation.mutate({
                                    id: product.id,
                                    isFeatured: !isProductFeatured,
                                  });
                                }}
                                disabled={toggleFeaturedMutation.isPending && toggleFeaturedMutation.variables?.id === product.id}
                              >
                                <Star className="h-5 w-5" fill={isProductFeatured ? "currentColor" : "none"} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No approved products</h3>
                  <p className="text-sm text-muted-foreground mt-1">Approved products will appear here for featuring control.</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "payouts" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Supplier Payouts</h1>
                <p className="text-sm text-muted-foreground">Manage and distribute payouts to agricultural suppliers</p>
              </div>
            </div>

            {payoutsLoading ? (
              <p className="text-muted-foreground">Loading supplier payouts...</p>
            ) : allPayouts && allPayouts.length > 0 ? (
              <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors bg-muted/20">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Supplier</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Payment Phone</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Sales Total</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Payout Amount</th>
                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[180px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {allPayouts.map((payout: any) => {
                        let statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                        if (payout.status === 'approved') {
                          statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                        } else if (payout.status === 'paid') {
                          statusColor = "bg-green-500/10 text-green-500 border-green-500/20";
                        }

                        return (
                          <tr key={payout.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div className="font-medium">{payout.sellerName}</div>
                              <div className="text-xs text-muted-foreground">{payout.sellerEmail}</div>
                            </td>
                            <td className="p-4 align-middle">{payout.paymentPhone}</td>
                            <td className="p-4 align-middle text-right font-semibold">
                              KES {Number(payout.totalAmount).toLocaleString()}
                            </td>
                            <td className="p-4 align-middle text-right font-bold text-primary">
                              {payout.payoutAmount ? `KES ${Number(payout.payoutAmount).toLocaleString()}` : "Not set"}
                            </td>
                            <td className="p-4 align-middle text-center">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${statusColor}`}>
                                {payout.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 align-middle text-center">
                              <div className="flex justify-center gap-2">
                                {payout.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      setCustomPayoutAmount(payout.totalAmount);
                                      setApprovePayoutDialogOpen(true);
                                    }}
                                  >
                                    Approve Amount
                                  </Button>
                                )}
                                {payout.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-green-600 text-white hover:bg-green-700 font-semibold"
                                    onClick={() => payPayoutMutation.mutate(payout.id)}
                                    disabled={payPayoutMutation.isPending && payPayoutMutation.variables === payout.id}
                                  >
                                    {payPayoutMutation.isPending && payPayoutMutation.variables === payout.id ? "Processing..." : "Pay via Phone"}
                                  </Button>
                                )}
                                {payout.status === 'paid' && (
                                  <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> Paid
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <DollarSign className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No payouts found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Sellers' orders payouts will appear here.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
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
              />
              <p className="text-xs text-muted-foreground mt-1">
                {rejectionReason.length} characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedProductId) {
                  rejectMutation.mutate({ id: selectedProductId, reason: rejectionReason });
                }
              }}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Confirming..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Approval Dialog */}
      <Dialog open={approvePayoutDialogOpen} onOpenChange={setApprovePayoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Supplier Payout</DialogTitle>
            <DialogDescription>
              Adjust and approve the payout amount. You can retain a commission from the total sales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Original Sales Subtotal</Label>
              <div className="font-semibold text-lg">
                KES {selectedPayout ? Number(selectedPayout.totalAmount).toLocaleString() : "0"}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payout-amount">Approved Payout Amount (KES) <span className="text-destructive">*</span></Label>
              <Input
                id="payout-amount"
                type="number"
                placeholder="Enter amount to pay seller"
                value={customPayoutAmount}
                onChange={(e) => setCustomPayoutAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                By default, this is equal to the supplier's items subtotal. You can enter a lower amount to deduct processing fees or commissions.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApprovePayoutDialogOpen(false);
                setSelectedPayout(null);
                setCustomPayoutAmount("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPayout && customPayoutAmount) {
                  approvePayoutMutation.mutate({
                    id: selectedPayout.id,
                    amount: Number(customPayoutAmount),
                  });
                }
              }}
              disabled={!customPayoutAmount || approvePayoutMutation.isPending}
            >
              {approvePayoutMutation.isPending ? "Approving..." : "Confirm & Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Create/Edit Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              Provide category details. You can either upload an image file or paste a direct image URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="category-name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder="e.g., Grains"
                className="mt-1.5"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category-desc">Description</Label>
              <Textarea
                id="category-desc"
                placeholder="Describe this category"
                className="mt-1.5 min-h-20"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              {categoryImageUrl && (
                <div className="relative aspect-[16/9] border rounded-lg overflow-hidden bg-muted group mb-3">
                  <img
                    src={categoryImageUrl}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-90 hover:opacity-100"
                    onClick={() => {
                      setCategoryImageUrl("");
                      setImageUrlInput("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL (e.g., https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCategoryImageUrl(imageUrlInput)}
                    disabled={!imageUrlInput.trim()}
                  >
                    Use URL
                  </Button>
                </div>
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <span className="relative bg-background px-2 text-xs text-muted-foreground">OR</span>
                </div>
                <div>
                  <Label
                    htmlFor="category-image-file"
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/30 cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="font-medium text-sm">
                      {categoryImageUploading ? "Uploading..." : "Click to upload image file"}
                    </span>
                    <input
                      id="category-image-file"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      disabled={categoryImageUploading}
                    />
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCategoryDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const data = {
                  name: categoryName,
                  description: categoryDescription,
                  imageUrl: categoryImageUrl || undefined
                };
                if (editingCategory) {
                  updateCategoryMutation.mutate({ id: editingCategory.id, data });
                } else {
                  createCategoryMutation.mutate(data);
                }
              }}
              disabled={
                !categoryName.trim() ||
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending
              }
            >
              {createCategoryMutation.isPending || updateCategoryMutation.isPending
                ? "Saving..."
                : "Save Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              Delete Category: {selectedCategoryToDelete?.name}
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>Are you sure you want to delete this category?</p>
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider bg-destructive/10 p-2.5 rounded border border-destructive/20">
                WARNING: Deleting this category will delete all products associated with it. This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCategoryToDelete) {
                  deleteCategoryMutation.mutate(selectedCategoryToDelete.id);
                }
              }}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
