import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProductSchema, updateProductSchema, insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes - allow buyers to upgrade to seller only
  app.patch('/api/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      // Get current user
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow buyer -> seller upgrade for self
      // Admin role can only be set via direct database access
      if (role === "seller" && currentUser.role === "buyer") {
        const user = await storage.updateUserRole(userId, role);
        return res.json(user);
      }
      
      return res.status(403).json({ message: "Role change not permitted" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.patch('/api/user/payout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = req.body;
      
      const user = await storage.updateUserPayoutMethod(userId, data);
      res.json(user);
    } catch (error) {
      console.error("Error updating payout method:", error);
      res.status(500).json({ message: "Failed to update payout method" });
    }
  });

  // Product routes
  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Only sellers can create products
      const user = await storage.getUser(userId);
      if (user?.role !== "seller" && user?.role !== "admin") {
        return res.status(403).json({ message: "Seller role required to create products" });
      }
      
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { status, sellerId, category } = req.query;
      const products = await storage.getProducts({
        status: status as any,
        sellerId: sellerId as string,
        category: category as string,
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.patch('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Only the seller who owns the product or admin can update
      if (product.sellerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }
      
      const updates = updateProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(req.params.id, updates);
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Only the seller who owns the product or admin can delete
      if (product.sellerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }
      
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Admin product approval routes
  app.post('/api/admin/products/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const product = await storage.approveProduct(req.params.id, userId);
      res.json(product);
    } catch (error) {
      console.error("Error approving product:", error);
      res.status(500).json({ message: "Failed to approve product" });
    }
  });

  app.post('/api/admin/products/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const product = await storage.rejectProduct(req.params.id, reason);
      res.json(product);
    } catch (error) {
      console.error("Error rejecting product:", error);
      res.status(500).json({ message: "Failed to reject product" });
    }
  });

  // Cart routes
  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      
      const cartItem = await storage.addToCart(cartData);
      res.json(cartItem);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.patch('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      // Verify the cart item belongs to the user
      const cartItems = await storage.getCartItems(userId);
      const cartItem = cartItems.find(item => item.id === req.params.id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found or access denied" });
      }
      
      const updated = await storage.updateCartItemQuantity(req.params.id, quantity);
      res.json(updated);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify the cart item belongs to the user
      const cartItems = await storage.getCartItems(userId);
      const cartItem = cartItems.find(item => item.id === req.params.id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found or access denied" });
      }
      
      await storage.removeCartItem(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        buyerId: userId,
      });
      
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { type } = req.query;
      
      // Admins can see all orders, others only their own
      const filters: any = {};
      
      if (user?.role === "admin") {
        // Admin can optionally filter by type
        if (type === "buyer") {
          filters.buyerId = userId;
        } else if (type === "seller") {
          filters.sellerId = userId;
        }
        // No filter means all orders for admin
      } else {
        // Non-admins must specify type and can only see their own
        if (type === "buyer") {
          filters.buyerId = userId;
        } else if (type === "seller") {
          filters.sellerId = userId;
        } else {
          // Default to buyer orders for non-admins if type not specified
          filters.buyerId = userId;
        }
      }
      
      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only buyer, seller, or admin can view this order
      if (order.buyerId !== userId && order.sellerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only seller or admin can update order status
      if (order.sellerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update order status" });
      }
      
      const updated = await storage.updateOrderStatus(req.params.id, status);
      res.json(updated);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.patch('/api/orders/:id/payment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only buyer (for their own order), seller, or admin can update payment
      if (order.buyerId !== userId && order.sellerId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update order payment" });
      }
      
      const updated = await storage.updateOrderPayment(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating order payment:", error);
      res.status(500).json({ message: "Failed to update order payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
