import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Cart from "@/pages/Cart";
import SellerDashboard from "@/pages/SellerDashboard";
import AddProduct from "@/pages/AddProduct";
import AdminDashboard from "@/pages/AdminDashboard";
import OrderTracking from "@/pages/OrderTracking";
import NotFound from "@/pages/not-found";
import CategoryProducts from "@/pages/category/[id]";
import ProductDetail from "@/pages/product/[id]";
import Products from "@/pages/products";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import Settings from "@/pages/Settings";
import Chat from "@/pages/Chat";

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
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/verify-otp" component={VerifyOtp} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/products" component={Products} />
        <Route path="/cart" component={Cart} />
        <Route path="/seller" component={SellerDashboard} />
        <Route path="/seller/add-product" component={AddProduct} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/orders/:id" component={OrderTracking} />
        {/* path to products of a specific category */}
        <Route path="/category/:id" component={CategoryProducts} />
        <Route path="/settings" component={Settings} />
        <Route path="/chat" component={Chat} />
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
