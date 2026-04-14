export interface OrderItem {
  id?: number;
  product: number;
  product_name?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  status: string;
  created_at?: string;
  username?: string;
  items: OrderItem[];
}