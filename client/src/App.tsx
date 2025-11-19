import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import SellerDashboard from "@/pages/SellerDashboard";
import AddProduct from "@/pages/AddProduct";
import AdminDashboard from "@/pages/AdminDashboard";
import OrderTracking from "@/pages/OrderTracking";
import NotFound from "@/pages/not-found";
import CategoryProducts from "@/pages/category/[id]";
function Router() {
  // const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* {isLoading || !isAuthenticated ? ( */}
      {/* {isLoading ? (
        <Route path="/" component={Home} />
      ) : ( */}
      <>
        <Route path="/" component={Home} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/seller" component={SellerDashboard} />
        <Route path="/seller/add-product" component={AddProduct} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/orders/:id" component={OrderTracking} />
        {/* path to products of a specific category */}
        <Route path="/category/:id" component={CategoryProducts} />
      </>
      {/* )} */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
