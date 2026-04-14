import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { Product } from '../../models/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: Product[] = [];
  categories: any[] = [];
  cart: Product[] = [];
  errorMessage = '';
  showForm = false;

  newProduct: Product = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 0
  };

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = [...data];
        this.cdr.detectChanges();
      },
      error: () => this.errorMessage = 'Ошибка загрузки продуктов'
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories = [...data];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  addToCart(product: Product) {
    this.cart.push(product);
  }

  createProduct() {
    this.api.createProduct(this.newProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.showForm = false;
        this.newProduct = { name: '', description: '', price: 0, stock: 0, category: 0 };
      },
      error: () => this.errorMessage = 'Ошибка создания продукта'
    });
  }

  deleteProduct(id: number) {
    this.api.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: () => this.errorMessage = 'Ошибка удаления'
    });
  }

  goToCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.router.navigate(['/cart']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}