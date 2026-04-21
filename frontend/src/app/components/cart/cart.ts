import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { Product } from '../../models/product';
import { TranslateService } from '../../services/translate';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartItems: Product[] = [];
  errorMessage = '';
  successMessage = '';

  constructor(private api: ApiService, private router: Router, public tr: TranslateService) {}

  ngOnInit() {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    const saved = localStorage.getItem('cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  isOrdering = false;

  placeOrder() {
    if (this.isOrdering) return;
    this.isOrdering = true;
    this.errorMessage = '';
    const items = this.cartItems.map(p => ({
      product_id: p.id,
      quantity: 1
    }));
    this.api.createOrder(items).subscribe({
      next: () => {
        this.successMessage = 'Заказ оформлен!';
        this.cartItems = [];
        localStorage.removeItem('cart');
        this.isOrdering = false;
      },
      error: () => {
        this.errorMessage = 'Ошибка оформления заказа';
        this.isOrdering = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}