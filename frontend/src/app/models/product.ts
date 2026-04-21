export interface Review {
  id?: number;
  username?: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  discounted_price?: number;
  category: number;
  category_name?: string;
  seller_name?: string;
  image?: string;
  discount?: number;
  reviews?: Review[];
  avg_rating?: number;
  created_at?: string;
}