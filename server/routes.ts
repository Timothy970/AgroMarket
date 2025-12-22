import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, updateProductSchema, insertCartItemSchema, insertOrderSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function generateAccessToken(user: any) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
}

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: "Unauthorized or missing token" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Expired or invalid token" });
    req.user = user;
    next();
  });
}
 function respondToClient(res: any,data: any , status: number, message: string) {
  res.status(status).json({ 
    "message": message,
    "data":data,
    "status_code":status

   });
}
export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    const { email } = req.body;
    if (!email) return respondToClient(res,null,400,"Email is required")

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return respondToClient(res,null,400,"User already exists")
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    await storage.createOtpRequest(email, otp);
    
    // In a real application, send this OTP via email
    console.log(`Registration OTP for ${email}: ${otp}`);
    
    respondToClient(res,{ otp },200,"OTP sent")
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    if (!email) return respondToClient(res,null,400,"Email is required")

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return respondToClient(res,null,404,"User not found")
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    await storage.createOtpRequest(email, otp);
    
    // In a real application, send this OTP via email
    console.log(`Login OTP for ${email}: ${otp}`);
    
    respondToClient(res,{ otp },200,"OTP sent")
  });

  app.post('/api/auth/verify', async (req, res) => {
    console.log("verify otp___",req.body);
    const { email, otp, role } = req.body;
    if (!email || !otp) return respondToClient(res,null,400,"Email and OTP are required")

    const isValid = await storage.verifyOtp(email, otp);
    if (!isValid) return respondToClient(res,null,400,"Invalid or expired OTP")

    let user = (await storage.getUserByEmail(email));
    if (!user) {
      // Create new user with specified role (default to buyer if not provided)
      user = await storage.createUser({ 
        email,
        role: role || "buyer" 
      });
    }

    const token = generateAccessToken(user);
    respondToClient(res,{ token, user },200,"Login successful")
  });

  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      respondToClient(res,user,200,"User fetched successfully")
    } catch (error) {
      console.error("Error fetching user:", error);
      respondToClient(res,null,500,"Failed to fetch user")
    }
  });

  //add admin users 
  app 

  // User routes - allow buyers to upgrade to seller only
  app.patch('/api/user/role', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.body;
      
      // Get current user
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return respondToClient(res,null,404,"User not found")
      }
      
      // Only allow buyer -> seller upgrade for self
      // Admin role can only be set via direct database access
      if (role === "seller" && currentUser.role === "buyer") {
        const user = await storage.updateUserRole(userId, role);
        return respondToClient(res,user,200,"User role updated successfully")
      }
      
      return respondToClient(res,null,403,"Role change not permitted")
    } catch (error) {
      console.error("Error updating user role:", error);
      respondToClient(res,null,500,"Failed to update role")
    }
  });

  app.patch('/api/user/payout', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;
      
      const user = await storage.updateUserPayoutMethod(userId, data);
      respondToClient(res,user,200,"Payout method updated successfully")
    } catch (error) {
      console.error("Error updating payout method:", error);
      respondToClient(res,null,500,"Failed to update payout method")
    }
  });

    // Categories routes
  app.post('/api/categories', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("User from token:", req.user);
      // Only sellers can create products
      const user = await storage.getUser(userId);
      console.log("User creating category:", user);
      if (user?.role !== "admin") {
        return respondToClient(res,null,403,"Admin role required to create categories")
      }
      console.log("Creating category with data:", req.body);
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const category = await storage.createCategory(categoryData);
      respondToClient(res,category,200,"Category created successfully")
    } catch (error: any) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return respondToClient(res,error.errors,400, "Validation error")
      }
      respondToClient(res,null,500,"Failed to create product")
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      respondToClient(res,categories,200,"Categories fetched successfully")
    } catch (error) {
      console.error("Error fetching categories:", error);
      respondToClient(res,null,500,"Failed to fetch categories")
    }
  });

  //category products
  app.get('/api/categories/:id/products', async (req, res) => {
    try {
      const categoryId = req.params.id;
      const products = await storage.getProducts({ category: categoryId });
      respondToClient(res,products,200,"Category products fetched successfully")
    } catch (error) {
      console.error("Error fetching category products:", error);
      respondToClient(res,null,500,"Failed to fetch category products")
    }
  });

  // Product routes
  app.post('/api/products', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only sellers and admins can create products
      const user = await storage.getUser(userId);
      if (user?.role !== "seller" && user?.role !== "admin") {
        return respondToClient(res,null,403,"Seller or Admin role required to create products")
      }
      
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      
      const product = await storage.createProduct(productData);
      respondToClient(res,product,200,"Product created successfully")
    } catch (error: any) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return respondToClient(res,error.errors,400, "Validation error")
      }
      respondToClient(res,null,500,"Failed to create product")
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
      respondToClient(res,products,200,"Products fetched successfully")
    } catch (error) {
      console.error("Error fetching products:", error);
      respondToClient(res,null,500,"Failed to fetch products")
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return respondToClient(res,null,404,"Product not found")
      }
      respondToClient(res,product,200,"Product fetched successfully")
    } catch (error) {
      console.error("Error fetching product:", error);
      respondToClient(res,null,500,"Failed to fetch product")
    }
  });

  app.patch('/api/products/:id', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return respondToClient(res,null,404,"Product not found")
      }
      
      // Only the seller who owns the product or admin can update
      if (product.sellerId !== userId && user?.role !== "admin") {
        return respondToClient(res,null,403,"Not authorized to update this product")
      }
      
      const updates = updateProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(req.params.id, updates);
      respondToClient(res,updatedProduct,200,"Product updated successfully")
    } catch (error: any) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return respondToClient(res,error.errors,400,"Validation error")
      }
      respondToClient(res,null,500,"Failed to update product")
    }
  });

  app.delete('/api/products/:id', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return respondToClient(res,null,404,"Product not found")
      }
      
      // Only the seller who owns the product or admin can delete
      if (product.sellerId !== userId && user?.role !== "admin") {
        return respondToClient(res,null,403,"Not authorized to delete this product")
      }
      
      await storage.deleteProduct(req.params.id);
      respondToClient(res,null,200,"Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error);
      respondToClient(res,null,500,"Failed to delete product")
    }
  });

  // Admin product approval routes
  app.post('/api/admin/products/:id/approve', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return respondToClient(res,null,403,"Admin access required")
      }
      
      const product = await storage.approveProduct(req.params.id, userId);
      respondToClient(res,product,200,"Product approved successfully")
    } catch (error) {
      console.error("Error approving product:", error);
      respondToClient(res,null,500,"Failed to approve product")
    }
  });

  app.post('/api/admin/products/:id/reject', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return respondToClient(res,null,403,"Admin access required")
      }
      
      const { reason } = req.body;
      if (!reason) {
        return respondToClient(res,null,400,"Rejection reason is required")
      }
      
      const product = await storage.rejectProduct(req.params.id, reason);
      respondToClient(res,product,200,"Product rejected successfully")
    } catch (error) {
      console.error("Error rejecting product:", error);
      respondToClient(res,null,500,"Failed to reject product")
    }
  });

  // Cart routes
  app.post('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      
      const cartItem = await storage.addToCart(cartData);
      respondToClient(res,cartItem,200,"Item added to cart successfully")
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      if (error instanceof z.ZodError) {
        return respondToClient(res,error.errors,400, "Validation error")
      }
      respondToClient(res,null,500,"Failed to add to cart")
    }
  });

  app.get('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      respondToClient(res,cartItems,200,"Cart fetched successfully")
    } catch (error) {
      console.error("Error fetching cart:", error);
      respondToClient(res,null,500,"Failed to fetch cart")
    }
  });

  app.patch('/api/cart/:id', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return respondToClient(res,null,400, "Invalid quantity. Quantity must be greater than 0")
      }
      
      // Verify the cart item belongs to the user
      const cart = await storage.getCartItems(userId);
      const cartItem = cart.items.find(item => item.id === req.params.id);
      
      if (!cartItem) {
        return respondToClient(res,null,404, "Cart item not found or access denied")
      }
      
      const updated = await storage.updateCartItemQuantity(req.params.id, quantity);
      respondToClient(res,updated,200,"Cart item updated successfully")
    } catch (error) {
      console.error("Error updating cart item:", error);
      respondToClient(res,null,500,"Failed to update cart item")
    }
  });

  app.delete('/api/cart/:id', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Verify the cart item belongs to the user
      const cart = await storage.getCartItems(userId);
      const cartItem = cart.items.find(item => item.id === req.params.id);
      
      if (!cartItem) {
        return respondToClient(res,null,404, "Cart item not found or access denied")
      }
      
      await storage.removeCartItem(req.params.id);
      respondToClient(res,null,200,"Item removed from cart")
    } catch (error) {
      console.error("Error removing cart item:", error);
      respondToClient(res,null,500,"Failed to remove cart item")
    }
  });

  app.delete('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      respondToClient(res,null,200,"Cart cleared")
    } catch (error) {
      console.error("Error clearing cart:", error);
      respondToClient(res,null,500,"Failed to clear cart")
    }
  });

  // Order routes
  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        buyerId: userId,
      });
      
      const order = await storage.createOrder(orderData);
      respondToClient(  res,order,200,"Order created successfully")
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return respondToClient(res,error.errors,400,"Validation error")
      }
      respondToClient(res,null,500,"Failed to create order")
    }
  });

  app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      respondToClient(res,orders,200,"Orders fetched successfully")
    } catch (error) {
      console.error("Error fetching orders:", error);
      respondToClient(res,null,500,"Failed to fetch orders")
    }
  });

  app.get('/api/orders/:id', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return respondToClient(res,null,404,"Order not found")
      }
      
      // Only buyer, seller, or admin can view this order
      if (order.buyerId !== userId && order.sellerId !== userId && user?.role !== "admin") {
        return respondToClient(res,null,403,"Not authorized to view this order")
      }
      
      respondToClient(res,order,200,"Order fetched successfully")
    } catch (error) {
      console.error("Error fetching order:", error);
      respondToClient(res,null,500,"Failed to fetch order")
    }
  });

  app.patch('/api/orders/:id/status', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const { status } = req.body;
      
      if (!status) {
        return respondToClient(res,null,400,"Status is required")
      }
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return respondToClient(res,null,404,"Order not found")
      }
      
      // Only seller or admin can update order status
      if (order.sellerId !== userId && user?.role !== "admin") {
        return respondToClient(res,null,403,"Not authorized to update order status")
      }
      
      const updated = await storage.updateOrderStatus(req.params.id, status);
      respondToClient(res,updated,200,"Order status updated successfully")
    } catch (error) {
      console.error("Error updating order status:", error);
      respondToClient(res,null,500,"Failed to update order status")
    }
  });

  app.patch('/api/orders/:id/payment', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return respondToClient(res,null,404,"Order not found")
      }
      
      // Only buyer (for their own order), seller, or admin can update payment
      if (order.buyerId !== userId && order.sellerId !== userId && user?.role !== "admin") {
        return respondToClient(res,null,403,"Not authorized to update order payment")
      }
      
      const updated = await storage.updateOrderPayment(req.params.id, req.body);
      respondToClient(res,updated,200,"Order payment updated successfully")
    } catch (error) {
      console.error("Error updating order payment:", error);
      respondToClient(res,null,500,"Failed to update order payment")
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
