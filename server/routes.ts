import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, updateProductSchema, insertCartItemSchema, insertOrderSchema, insertCategorySchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_secret", {
  apiVersion: "2025-01-27.acacia" as any,
});

// Configure local uploads storage
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storageConfig });

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

async function sendSMSNotification(phone: string, messageText: string) {
  const formattedPhone = phone.replace(/\+/g, '').replace(/^0/, '254');
  console.log(`[SMS NOTIFICATION] Sent to +${formattedPhone}: ${messageText}`);

  if (process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.includes("placeholder")) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: messageText,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+${formattedPhone}`,
      });
      console.log("SMS sent successfully via Twilio");
    } catch (err) {
      console.error("Failed to send SMS via Twilio:", err);
    }
  }
}

async function handleMpesaCallbackLogic(orderId: string, payload: any) {
  const resultCode = payload.Body.stkCallback.ResultCode;
  if (resultCode === 0) {
    const items = payload.Body.stkCallback.CallbackMetadata?.Item || [];
    const receiptItem = items.find((i: any) => i.Name === "MpesaReceiptNumber");
    const receipt = receiptItem ? receiptItem.Value : "MPESA_SUCCESS";
    
    const order = await storage.getOrder(orderId);
    if (order) {
      const isDeposit = order.items.some(i => i.purchaseMode === 'bulk') && !order.depositPaid;
      if (isDeposit) {
        await storage.updateOrderPayment(orderId, { depositPaid: true, stripePaymentIntentId: receipt });
      } else {
        await storage.updateOrderPayment(orderId, { balancePaid: true, stripePaymentIntentId: receipt });
        await storage.updateOrderStatus(orderId, "approved");
      }
      console.log(`M-Pesa payment processed for Order ${orderId}, Receipt: ${receipt}`);
    }
  }
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

  // Local File Upload Route
  app.post('/api/upload', authenticateToken, upload.single('image'), (req: any, res) => {
    try {
      if (!req.file) {
        return respondToClient(res, null, 400, "No file uploaded");
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      respondToClient(res, { url: fileUrl }, 200, "Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      respondToClient(res, null, 500, "Failed to upload image");
    }
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
      const { status, sellerId, category, search } = req.query;
      const products = await storage.getProducts({
        status: status as any,
        sellerId: sellerId as string,
        category: category as string,
        search: search as string,
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

  // Admin users route
  app.get('/api/admin/users', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return respondToClient(res, null, 403, "Admin access required");
      }
      const allUsers = await storage.getUsers();
      respondToClient(res, allUsers, 200, "Users fetched successfully");
    } catch (error) {
      console.error("Error fetching users:", error);
      respondToClient(res, null, 500, "Failed to fetch users");
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
      const { items, ...orderRest } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return respondToClient(res, null, 400, "Order must contain at least one item");
      }

      const orderData = insertOrderSchema.parse({
        ...orderRest,
        buyerId: userId,
      });

      const parsedItems = z.array(insertOrderItemSchema.omit({ orderId: true })).parse(items);
      
      const order = await storage.createOrder(orderData, parsedItems);
      
      const seller = await storage.getUser(order.sellerId);
      if (seller && seller.mobileNumber) {
        await sendSMSNotification(seller.mobileNumber, `AgroMarket: You have a new order #${order.id.slice(0, 8)} waiting. Please open your seller dashboard to approve.`);
      }
      
      respondToClient(res, order, 200, "Order created successfully");
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return respondToClient(res, error.errors, 400, "Validation error");
      }
      respondToClient(res, null, 500, "Failed to create order");
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
      
      const buyer = await storage.getUser(order.buyerId);
      if (buyer && buyer.mobileNumber) {
        await sendSMSNotification(buyer.mobileNumber, `AgroMarket: Your order #${order.id.slice(0, 8)} status has changed to "${status.toUpperCase()}".`);
      }
      
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

  // Chat endpoints
  app.get('/api/chat/messages/:receiverId', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { receiverId } = req.params;
      const messages = await storage.getMessages(userId, receiverId);
      respondToClient(res, messages, 200, "Messages fetched successfully");
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      respondToClient(res, null, 500, "Failed to fetch chat messages");
    }
  });

  app.get('/api/chat/conversations', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getConversations(userId);
      respondToClient(res, conversations, 200, "Conversations fetched successfully");
    } catch (error) {
      console.error("Error fetching conversations:", error);
      respondToClient(res, null, 500, "Failed to fetch conversations");
    }
  });

  // Stripe payments endpoints
  app.post('/api/payments/stripe/create-checkout-session', authenticateToken, async (req: any, res) => {
    try {
      const { orderId, amount, isDeposit } = req.body;
      if (!orderId || !amount) {
        return respondToClient(res, null, 400, "orderId and amount are required");
      }

      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
        const mockSessionId = "cs_test_" + crypto.randomBytes(16).toString("hex");
        return respondToClient(res, { url: `/orders/${orderId}?payment=stripe_success`, id: mockSessionId }, 200, "Simulated Checkout Session created");
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'kes',
              product_data: {
                name: `Payment for Order #${orderId.slice(0, 8)} ${isDeposit ? '(Deposit)' : '(Full Payment)'}`,
              },
              unit_amount: Math.round(Number(amount) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin || "http://localhost:8010"}/orders/${orderId}?payment=stripe_success`,
        cancel_url: `${req.headers.origin || "http://localhost:8010"}/orders/${orderId}?payment=stripe_cancel`,
        metadata: {
          orderId,
          isDeposit: isDeposit ? 'true' : 'false',
        },
      });

      respondToClient(res, { url: session.url, id: session.id }, 200, "Stripe Checkout Session created");
    } catch (error: any) {
      console.error("Error creating Stripe checkout session:", error);
      respondToClient(res, null, 500, error.message || "Failed to create checkout session");
    }
  });

  app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
        event = stripe.webhooks.constructEvent(req.rawBody as any, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const isDeposit = session.metadata?.isDeposit === 'true';

      if (orderId) {
        if (isDeposit) {
          await storage.updateOrderPayment(orderId, { depositPaid: true, stripePaymentIntentId: session.payment_intent as string });
        } else {
          await storage.updateOrderPayment(orderId, { balancePaid: true, stripePaymentIntentId: session.payment_intent as string });
          await storage.updateOrderStatus(orderId, "approved");
        }
        console.log(`Payment updated for Order ${orderId}`);
      }
    }

    res.json({ received: true });
  });

  // M-Pesa payment endpoints
  app.post('/api/payments/mpesa/stkpush', authenticateToken, async (req: any, res) => {
    try {
      const { orderId, phoneNumber, amount, type, shortcode, accountRef } = req.body;
      if (!orderId || !phoneNumber || !amount) {
        return respondToClient(res, null, 400, "orderId, phoneNumber, and amount are required");
      }

      const formattedPhone = phoneNumber.replace(/\+/g, '').replace(/^0/, '254');

      console.log(`Triggering M-Pesa STK Push to ${formattedPhone} for KES ${amount} (${type})`);

      if (!process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY.includes("placeholder")) {
        setTimeout(async () => {
          console.log(`Simulating M-Pesa Callback for Order ${orderId}`);
          const fakeCallback = {
            Body: {
              stkCallback: {
                MerchantRequestID: "fake-merchant-id-" + crypto.randomUUID(),
                CheckoutRequestID: "fake-checkout-id-" + crypto.randomUUID(),
                ResultCode: 0,
                ResultDesc: "The service request is processed successfully.",
                CallbackMetadata: {
                  Item: [
                    { Name: "Amount", Value: amount },
                    { Name: "MpesaReceiptNumber", Value: "NL" + crypto.randomBytes(4).toString("hex").toUpperCase() },
                    { Name: "TransactionDate", Value: Date.now() },
                    { Name: "PhoneNumber", Value: formattedPhone }
                  ]
                }
              }
            }
          };
          await handleMpesaCallbackLogic(orderId, fakeCallback);
        }, 3000);

        return respondToClient(res, { 
          MerchantRequestID: "simulated-merchant-id", 
          CheckoutRequestID: "simulated-checkout-id", 
          ResponseDescription: "Success. Request accepted for processing." 
        }, 200, "M-Pesa STK Push Simulated");
      }

      const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
      const authResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: { Authorization: `Basic ${auth}` }
      });
      const authData: any = await authResponse.json();
      const accessToken = authData.access_token;

      const shortCode = shortcode || process.env.MPESA_SHORTCODE || "174379";
      const passKey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString("base64");

      const commandId = type === "till" ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline";
      
      const bodyPayload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: commandId,
        Amount: Math.round(Number(amount)),
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: (process.env.MPESA_CALLBACK_URL || "http://localhost:8010/api/payments/mpesa/callback") + `?orderId=${orderId}`,
        AccountReference: accountRef || `Order-${orderId.slice(0, 6)}`,
        TransactionDesc: `AgroMarket Payment ${orderId.slice(0, 6)}`
      };

      const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyPayload)
      });

      const resData: any = await response.json();
      respondToClient(res, resData, 200, "M-Pesa STK Push Sent");
    } catch (error: any) {
      console.error("M-Pesa STK Push error:", error);
      respondToClient(res, null, 500, error.message || "Failed to trigger M-Pesa STK Push");
    }
  });

  app.post('/api/payments/mpesa/callback', async (req, res) => {
    try {
      const { orderId } = req.query;
      if (orderId) {
        await handleMpesaCallbackLogic(orderId as string, req.body);
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      res.status(500).send("Callback processing failed");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
