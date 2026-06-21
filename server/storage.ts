import {
  users,
  products,
  cartItems,
  orders,
  otpRequests,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type UpdateProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  categories,
  Category,
  UpdateCategory,
  InsertCategory,
  orderItems,
  type OrderItem,
  type InsertOrderItem,
  messages,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: Partial<UpsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: "buyer" | "seller" | "admin"): Promise<User>;
  updateUserPayoutMethod(userId: string, data: {
    payoutMethod: "mobile_money" | "bank_transfer" | "paypal";
    mobileNumber?: string;
    bankName?: string;
    bankAccount?: string;
    paypalEmail?: string;
  }): Promise<User>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(filters?: {
    status?: "pending" | "approved" | "rejected";
    sellerId?: string;
    category?: string;
    search?: string;
  }): Promise<Product[]>;
  updateProduct(id: string, updates: UpdateProduct): Promise<Product>;
  approveProduct(id: string, adminId: string): Promise<Product>;
  rejectProduct(id: string, reason: string): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Cart operations
  addToCart(item: InsertCartItem): Promise<{
    items: (CartItem & { product: Product })[];
    sub_total: number;
    discount: number;
    total: number;
    estimated_tax: number;
    delivery_charge: number;
  }>;
  getCartItems(userId: string): Promise<{
    items: (CartItem & { product: Product })[];
    sub_total: number;
    discount: number;
    total: number;
    estimated_tax: number;
    delivery_charge: number;
  }>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem>;
  removeCartItem(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order & { items: OrderItem[] }>;
  getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | undefined>;
  getOrders(filters?: {
    buyerId?: string;
    sellerId?: string;
    status?: string;
  }): Promise<(Order & { items: OrderItem[] })[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  updateOrderPayment(id: string, updates: {
    depositPaid?: boolean;
    balancePaid?: boolean;
    stripePaymentIntentId?: string;
  }): Promise<Order>;

  // Chat operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  getConversations(userId: string): Promise<{ otherUser: User; lastMessage: Message }[]>;

  // OTP operations
  createOtpRequest(email: string, otp: string): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: "buyer" | "seller" | "admin"): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserPayoutMethod(userId: string, data: {
    payoutMethod: "mobile_money" | "bank_transfer" | "paypal";
    mobileNumber?: string;
    bankName?: string;
    bankAccount?: string;
    paypalEmail?: string;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  //category opreations
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(desc(categories.createdAt));
  }

  async updateCategory(id: string, updates: UpdateCategory): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(filters?: {
    status?: "pending" | "approved" | "rejected";
    sellerId?: string;
    category?: string;
    search?: string;
  }): Promise<Product[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(products.status, filters.status));
    }
    if (filters?.sellerId) {
      conditions.push(eq(products.sellerId, filters.sellerId));
    }
    if (filters?.category) {
      conditions.push(eq(products.categoryId, filters.category));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
    }
    
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async updateProduct(id: string, updates: UpdateProduct): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async approveProduct(id: string, adminId: string): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        status: "approved",
        approvedAt: new Date(),
        approvedBy: adminId,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async rejectProduct(id: string, reason: string): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        status: "rejected",
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart operations
  async addToCart(item: InsertCartItem): Promise<{
    items: (CartItem & { product: Product })[];
    sub_total: number;
    discount: number;
    total: number;
    estimated_tax: number;
    delivery_charge: number;
  }> {
    // Check if item already exists in cart
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, item.userId),
          eq(cartItems.productId, item.productId)
        )
      );

    if (existing) {
      // Update quantity if exists
      await db
        .update(cartItems)
        .set({ 
          quantity: (existing.quantity || 0) + (item.quantity || 1),
          updatedAt: new Date() 
        })
        .where(eq(cartItems.id, existing.id))
        .returning();
    } else {
      await db.insert(cartItems).values(item).returning();
    }

    // Return full cart data
    return this.getCartItems(item.userId);
  }

  async getCartItems(userId: string): Promise<{
    items: (CartItem & { product: Product })[];
    sub_total: number;
    discount: number;
    total: number;
    estimated_tax: number;
    delivery_charge: number;
  }> {
    const items = await db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    const detailedItems = items.map(({ cartItem, product }) => ({
      ...cartItem,
      product,
    }));

    let sub_total = 0;
    for (const item of detailedItems) {
      const price = item.purchaseMode === "bulk" && item.product.bulkPrice
        ? Number(item.product.bulkPrice)
        : Number(item.product.smallPrice);
      sub_total += price * item.quantity;
    }

    const estimated_tax = Math.round(sub_total * 0.16);
    const delivery_charge = 0;
    const discount = 0;
    const total = sub_total + estimated_tax + delivery_charge - discount;

    return {
      items: detailedItems,
      sub_total,
      discount,
      total,
      estimated_tax,
      delivery_charge,
    };
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.productId, id))
      .returning();
    return item;
  }

  async removeCartItem(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.productId, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order & { items: OrderItem[] }> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      const itemsToInsert = items.map((item) => ({
        ...item,
        orderId: newOrder.id,
      }));
      const newItems = await tx.insert(orderItems).values(itemsToInsert).returning();
      return {
        ...newOrder,
        items: newItems,
      };
    });
  }

  async getOrder(id: string): Promise<(Order & { items: (OrderItem & { image: string })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    const items = await db
      .select({
        item: orderItems,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));
    
    const detailedItems = items.map(({ item, product }) => ({
      ...item,
      image: product.images[0] || "",
    }));

    return {
      ...order,
      items: detailedItems,
    };
  }

  async getOrders(filters?: {
    buyerId?: string;
    sellerId?: string;
    status?: string;
  }): Promise<(Order & { items: (OrderItem & { image: string })[] })[]> {
    const conditions = [];
    if (filters?.buyerId) {
      conditions.push(eq(orders.buyerId, filters.buyerId));
    }
    if (filters?.sellerId) {
      conditions.push(eq(orders.sellerId, filters.sellerId));
    }
    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status as any));
    }
    
    let fetchedOrders: Order[];
    if (conditions.length > 0) {
      fetchedOrders = await db.select().from(orders).where(and(...conditions)).orderBy(desc(orders.createdAt));
    } else {
      fetchedOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    }

    if (fetchedOrders.length === 0) return [];

    const orderIds = fetchedOrders.map(o => o.id);
    const allItems = await db
      .select({
        item: orderItems,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    const detailedItems = allItems.map(({ item, product }) => ({
      ...item,
      image: product.images[0] || "",
    }));

    return fetchedOrders.map(order => ({
      ...order,
      items: detailedItems.filter(item => item.orderId === order.id),
    }));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async updateOrderPayment(id: string, updates: {
    depositPaid?: boolean;
    balancePaid?: boolean;
    stripePaymentIntentId?: string;
  }): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // OTP operations
  async createOtpRequest(email: string, otp: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await db.insert(otpRequests).values({
      email,
      otp,
      expiresAt,
    });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const [request] = await db
      .select()
      .from(otpRequests)
      .where(
        and(
          eq(otpRequests.email, email),
          eq(otpRequests.otp, otp),
          eq(otpRequests.verified, false)
        )
      )
      .orderBy(desc(otpRequests.createdAt))
      .limit(1);

    if (!request) return false;
console.log("otp request___",request); 
    if (new Date() > request.expiresAt) return false;

    // Mark as verified
    await db
      .update(otpRequests)
      .set({ verified: true })
      .where(eq(otpRequests.id, request.id));

    return true;
  }

  // Chat operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async getConversations(userId: string): Promise<{ otherUser: User; lastMessage: Message }[]> {
    const allUserMessages = await db
      .select({
        message: messages,
      })
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));

    const conversationsMap = new Map<string, { otherUserId: string; lastMessage: Message }>();
    
    for (const row of allUserMessages) {
      const msg = row.message;
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          otherUserId: partnerId,
          lastMessage: msg,
        });
      }
    }

    const result: { otherUser: User; lastMessage: Message }[] = [];
    const partnerIds: string[] = [];
    conversationsMap.forEach((_, partnerId) => {
      partnerIds.push(partnerId);
    });

    for (const partnerId of partnerIds) {
      const partner = await this.getUser(partnerId);
      if (partner) {
        const data = conversationsMap.get(partnerId);
        if (data) {
          result.push({
            otherUser: partner,
            lastMessage: data.lastMessage,
          });
        }
      }
    }

    return result;
  }
}

export const storage = new DatabaseStorage();
