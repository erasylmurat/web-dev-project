import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Token ${token}` });
  }

  // Auth
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, { username, password });
  }

  register(username: string, email: string, password: string, role: string = 'buyer'): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/`, { username, email, password, role });
  }
  // Auth helpers
  saveUserData(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isSeller(): boolean {
    return this.getRole() === 'seller';
  }

  isBuyer(): boolean {
    return this.getRole() === 'buyer';
  }

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}/`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products/`, product, { headers: this.getHeaders() });
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}/`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}/`, { headers: this.getHeaders() });
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories/`);
  }

  // Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/`, { headers: this.getHeaders() });
  }

  createOrder(items: any[]): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/`, { items }, { headers: this.getHeaders() });
  }
  // Reviews
  getReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products/${productId}/reviews/`);
  }

  addReview(productId: number, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/products/${productId}/reviews/`, data, { headers: this.getHeaders() });
  }

  // Products with filters
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/?category=${categoryId}`);
 }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/?search=${query}`);
 }

  getDiscountedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/?discount=true`);
  }

  createProductWithImage(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });
    return this.http.post(`${this.baseUrl}/products/`, formData, { headers });
  }
}

