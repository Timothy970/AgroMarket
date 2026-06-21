import api from './axios';
import type { 
  Category, 
  InsertCategory, 
  Product, 
  InsertProduct, 
  UpdateProduct,
  CartItem,
  InsertCartItem,
  Order,
  InsertOrder,
  User,
  OrderItem
} from '@shared/schema';

export type OrderWithItems = Order & {
  items: (OrderItem & { image?: string | null })[];
};

// API Response wrapper type
type ApiResponse<T> = {
  message: string;
  data: T;
  status_code: number;
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>('/api/categories');
    return response.data;
  },
  
  create: async (data: InsertCategory): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>('/api/categories', data);
    return response.data;
  },
};

// Products API
export const productsApi = {
  getAll: async (filters?: { status?: 'pending' | 'approved' | 'rejected'; sellerId?: string; category?: string; search?: string }): Promise<ApiResponse<Product[]>> => {
    const response = await api.get<ApiResponse<Product[]>>('/api/products', { params: filters });
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
    return response.data;
  },
  
  create: async (data: Omit<InsertProduct, 'sellerId'>): Promise<ApiResponse<Product>> => {
    const response = await api.post<ApiResponse<Product>>('/api/products', data);
    return response.data;
  },
  
  update: async (id: string, data: UpdateProduct): Promise<ApiResponse<Product>> => {
    const response = await api.patch<ApiResponse<Product>>(`/api/products/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/api/products/${id}`);
    return response.data;
  },
};
export type AddCartPayload = {
  productId: string;
  quantity: number;
  purchaseMode?: 'small' | 'bulk';
}

export type CartResponse = {
  items: (CartItem & { product: Product })[];
  sub_total: number;
  discount: number;
  total: number;
  estimated_tax: number;
  delivery_charge: number;
};
// Cart API
export const cartApi = {
  getItems: async (token: string): Promise<ApiResponse<CartResponse>> => {
    const response = await api.get<ApiResponse<CartResponse>>('/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  addItem: async (data: AddCartPayload, token: string): Promise<ApiResponse<CartResponse>> => {
    const response = await api.post<ApiResponse<CartResponse>>('/api/cart', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  updateQuantity: async (id: string, quantity: number, token: string): Promise<ApiResponse<CartItem>> => {
    const response = await api.patch<ApiResponse<CartItem>>(`/api/cart/${id}`, { quantity }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  removeItem: async (id: string, token: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/api/cart/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
  clear: async (token: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>('/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export const ordersApi = {
  getAll: async (type?: 'buyer' | 'seller'): Promise<ApiResponse<OrderWithItems[]>> => {
    const response = await api.get<ApiResponse<OrderWithItems[]>>('/api/orders', { params: { type } });
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<OrderWithItems>> => {
    const response = await api.get<ApiResponse<OrderWithItems>>(`/api/orders/${id}`);
    return response.data;
  },
  
  create: async (data: InsertOrder): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>('/api/orders', data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: 'placed' | 'approved' | 'packed' | 'shipped' | 'awaiting_payment' | 'delivered' | 'cancelled'): Promise<ApiResponse<Order>> => {
    const response = await api.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status });
    return response.data;
  },
  
  updatePayment: async (id: string, data: { depositPaid?: boolean; balancePaid?: boolean; stripePaymentIntentId?: string }): Promise<ApiResponse<Order>> => {
    const response = await api.patch<ApiResponse<Order>>(`/api/orders/${id}/payment`, data);
    return response.data;
  },
};

// Auth API
export const authApi = {
  register: async (email: string): Promise<ApiResponse<{ otp: string }>> => {
    const response = await api.post<ApiResponse<{ otp: string }>>('/api/auth/register', { email });
    return response.data;
  },
  
  login: async (email: string): Promise<ApiResponse<{ otp: string }>> => {
    const response = await api.post<ApiResponse<{ otp: string }>>('/api/auth/login', { email });
    return response.data;
  },
  
  verify: async (email: string, otp: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/api/auth/verify', { email, otp });
    return response.data;
  },
  
  getUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/api/auth/user');
    return response.data;
  },
};

// User API
export const userApi = {
  updateRole: async (role: 'buyer' | 'seller'): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>('/api/user/role', { role });
    return response.data;
  },
  
  updatePayoutMethod: async (data: {
    payoutMethod: 'mobile_money' | 'bank_transfer' | 'paypal';
    mobileNumber?: string;
    bankName?: string;
    bankAccount?: string;
    paypalEmail?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>('/api/user/payout', data);
    return response.data;
  },
};
