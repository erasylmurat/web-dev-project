export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: number;
  category_name?: string;
  created_at?: string;
}