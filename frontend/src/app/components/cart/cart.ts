import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  cartItems: { product: Product; quantity: number }[] = [];
  errorMessage = '';
  successMessage = '';
  isOrdering = false;

  constructor(private api: ApiService, private router: Router, public tr: TranslateService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCart();
  }

  loadCart() {
    const raw: Product[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const map = new Map<number, { product: Product; quantity: number }>();
    raw.forEach(p => {
      if (map.has(p.id!)) {
        map.get(p.id!)!.quantity++;
      } else {
        map.set(p.id!, { product: p, quantity: 1 });
      }
    });
    this.cartItems = Array.from(map.values());
  }

  saveCart() {
    const raw: Product[] = [];
    this.cartItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        raw.push(item.product);
      }
    });
    localStorage.setItem('cart', JSON.stringify(raw));
  }

  increment(index: number) {
    if (index < this.cartItems.length) {
      this.cartItems[index].quantity++;
      this.saveCart();
    }
  }

  decrement(index: number) {
    if (index < this.cartItems.length) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
      } else {
        this.cartItems.splice(index, 1);
      }
      this.saveCart();
    }
  }

  getItemPrice(item: { product: Product; quantity: number }): number {
    const price = item.product.discounted_price ?? Number(item.product.price);
    return price * item.quantity;
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getItemPrice(item), 0);
  }

  placeOrder() {
    if (this.isOrdering || this.cartItems.length === 0) return;
    this.isOrdering = true;
    this.errorMessage = '';
    const items = this.cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));
    this.api.createOrder(items).subscribe({
      next: () => {
        this.cartItems = [];
        localStorage.removeItem('cart');
        this.isOrdering = false;
        this.successMessage = 'Заказ оформлен! ✓';
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Ошибка оформления заказа';
        this.isOrdering = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}