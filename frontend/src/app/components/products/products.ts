import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import { Product } from '../../models/product';
import { TranslateService } from '../../services/translate';

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
  searchQuery = '';
  selectedCategory = 0;
  showDiscounted = false;
  newProduct: Product = { name: '', description: '', price: 0, stock: 0, category: 0, discount: 0 };
  selectedImage: File | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public tr: TranslateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] ? +params['category'] : 0;
      this.showDiscounted = params['discount'] === 'true';
      this.loadProducts();
    });
    this.loadCategories();
  }

  loadProducts() {
    let url = 'http://127.0.0.1:8000/api/products/?';
    if (this.selectedCategory) url += `category=${this.selectedCategory}&`;
    if (this.searchQuery) url += `search=${this.searchQuery}&`;
    if (this.showDiscounted) url += `discount=true`;
    this.api.getProducts().subscribe({
      next: (data) => {
        let filtered = [...data];
        if (this.selectedCategory) filtered = filtered.filter(p => p.category === this.selectedCategory);
        if (this.searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
        if (this.showDiscounted) filtered = filtered.filter(p => p.discount && p.discount > 0);
        this.products = filtered;
        this.cdr.detectChanges();
      },
      error: () => this.errorMessage = 'Ошибка загрузки продуктов'
    });
  }
  

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (data) => { this.categories = [...data]; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  onSearch() { this.loadProducts(); }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  createProduct() {
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('description', this.newProduct.description);
    formData.append('price', this.newProduct.price.toString());
    formData.append('stock', this.newProduct.stock.toString());
    formData.append('category', this.newProduct.category.toString());
    formData.append('discount', (this.newProduct.discount || 0).toString());
    if (this.selectedImage) formData.append('image', this.selectedImage);

    this.api.createProductWithImage(formData).subscribe({
      next: () => {
        this.loadProducts();
        this.showForm = false;
        this.newProduct = { name: '', description: '', price: 0, stock: 0, category: 0, discount: 0 };
        this.selectedImage = null;
      },
      error: () => this.errorMessage = 'Ошибка создания продукта'
    });
  }

  addToCart(product: Product) { this.cart.push(product); }

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

  goToProduct(id: number) { this.router.navigate(['/products', id]); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  getImageUrl(image: string): string {
    if (image.startsWith('http')) return image;
    return `http://127.0.0.1:8000${image}`;
  }
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  isAdmin(): boolean { return localStorage.getItem('role') === 'admin'; }
  isSeller(): boolean { return localStorage.getItem('role') === 'seller'; }
  isBuyer(): boolean { return localStorage.getItem('role') === 'buyer'; }
  getUsername(): string { return localStorage.getItem('username') || ''; }
}