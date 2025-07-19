import client from '../../api/client';

export type MarketplaceCategory = {
  id: number;
  name: string;
  icon?: string;
};

export type MarketplaceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  negotiable?: boolean;
  category: MarketplaceCategory;
  condition: string;
  images: string[];
  deliveryMethod: string;
  location: string;
  status: string;
  seller: any;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceOrder = {
  id: number;
  item: MarketplaceItem;
  buyer: any;
  seller: any;
  price: number;
  status: string;
  deliveryMethod: string;
  paymentMethod: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceReview = {
  id: number;
  item: MarketplaceItem;
  reviewer: any;
  rating: number;
  comment: string;
  createdAt: string;
};

export type MarketplaceBusinessAccount = {
  id: number;
  user: any;
  businessName: string;
  description: string;
  logo: string;
  contactInfo: string;
};

const marketplaceService = {
  async getItems() {
    const res = await client.get('/marketplace/items');
    return res.data;
  },
  async getCategories() {
    const res = await client.get('/marketplace/categories');
    return res.data;
  },
  async searchItems(keyword: string) {
    const res = await client.get(`/marketplace/items/search?keyword=${encodeURIComponent(keyword)}`);
    return res.data;
  },
  async getItemsByCategory(categoryId: number) {
    const res = await client.get(`/marketplace/items/category/${categoryId}`);
    return res.data;
  },
  async getItem(itemId: number) {
    const res = await client.get(`/marketplace/items/${itemId}`);
    return res.data;
  },
  async createItem(item: Partial<MarketplaceItem>) {
    const res = await client.post('/marketplace/items', item);
    return res.data;
  },
  async updateItem(itemId: number, item: Partial<MarketplaceItem>) {
    const res = await client.put(`/marketplace/items/${itemId}`, item);
    return res.data;
  },
  async deleteItem(itemId: number) {
    await client.delete(`/marketplace/items/${itemId}`);
  },
  async getOrders() {
    const res = await client.get('/marketplace/orders');
    return res.data;
  },
  async createOrder(order: Partial<MarketplaceOrder>) {
    const res = await client.post('/marketplace/orders', order);
    return res.data;
  },
  async getReviews(itemId: number) {
    const res = await client.get(`/marketplace/reviews/item/${itemId}`);
    return res.data;
  },
  async createReview(review: Partial<MarketplaceReview>) {
    const res = await client.post('/marketplace/reviews', review);
    return res.data;
  },
  async getBusinessAccount(userId: number) {
    const res = await client.get(`/marketplace/business-accounts/user/${userId}`);
    return res.data;
  },
  async createBusinessAccount(account: Partial<MarketplaceBusinessAccount>) {
    const res = await client.post('/marketplace/business-accounts', account);
    return res.data;
  },
};

export default marketplaceService; 