import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  errorMessage = '';
  cartMessage = '';
  newReview = { rating: 5, comment: '' };
  reviewError = '';
  reviewSuccess = '';
  canReview = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(+id);
  }

  loadProduct(id: number) {
    this.api.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.checkCanReview();
        this.cdr.detectChanges();
      },
      error: () => this.errorMessage = 'Товар не найден'
    });
  }

  checkCanReview() {
    if (!this.isLoggedIn() || !this.product?.id || this.isSeller()) {
      this.canReview = false;
      return;
    }
    this.api.getOrders().subscribe({
      next: (orders) => {
        const productId = this.product!.id;
        // Считаем сколько раз купил
        let purchaseCount = 0;
        orders.forEach(order => {
          order.items.forEach((item: any) => {
            if (item.product === productId) purchaseCount++;
          });
        });
        // Считаем сколько отзывов уже оставил
        const myReviews = (this.product!.reviews || []).filter(
          r => r.username === localStorage.getItem('username')
        ).length;
        this.canReview = purchaseCount > myReviews;
        this.cdr.detectChanges();
      },
      error: () => { this.canReview = false; }
    });
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  addToCart() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(this.product);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartMessage = 'Добавлено в корзину!';
    setTimeout(() => this.cartMessage = '', 2000);
  }

  submitReview() {
    if (!this.product?.id) return;
    if (!this.isLoggedIn()) {
      this.reviewError = 'Войдите чтобы оставить отзыв';
      return;
    }
    this.reviewError = '';
    this.api.addReview(this.product.id, this.newReview).subscribe({
      next: () => {
        this.reviewSuccess = 'Отзыв добавлен!';
        this.reviewError = '';
        this.newReview = { rating: 5, comment: '' };
        this.loadProduct(this.product!.id!);
      },
      error: (err) => {
        this.reviewError = err?.error?.error || 'Ошибка при добавлении отзыва';
      }
    });
  }

  getCartCount(): number {
    return JSON.parse(localStorage.getItem('cart') || '[]').length;
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  isSeller(): boolean { return localStorage.getItem('role') === 'seller'; }
  getImageUrl(image: string): string {
    if (image.startsWith('http')) return image;
    return `http://127.0.0.1:8000${image}`;
  }
}