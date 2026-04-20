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
  newReview = { rating: 5, comment: '' };
  reviewError = '';
  reviewSuccess = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
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
        this.cdr.detectChanges();
      },
      error: () => this.errorMessage = 'Товар не найден'
    });
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  addToCart() {
    if (!this.product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(this.product);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.router.navigate(['/cart']);
  }

  submitReview() {
    if (!this.product?.id) return;
    if (!localStorage.getItem('token')) {
      this.reviewError = 'Войдите чтобы оставить отзыв';
      return;
    }
    this.api.addReview(this.product.id, this.newReview).subscribe({
      next: () => {
        this.reviewSuccess = 'Отзыв добавлен!';
        this.reviewError = '';
        this.newReview = { rating: 5, comment: '' };
        this.loadProduct(this.product!.id!);
      },
      error: () => this.reviewError = 'Ошибка при добавлении отзыва'
    });
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  isSeller(): boolean { return localStorage.getItem('role') === 'seller'; }
  getImageUrl(image: string): string {
    return `http://127.0.0.1:8000${image}`;
  }
}