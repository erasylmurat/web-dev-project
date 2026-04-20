import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../services/api';
import { TranslateService } from '../../services/translate';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {
  categories: any[] = [];
  showCategoryForm = false;
  newCategory = { name: '', description: '' };
  selectedCategoryImage: File | null = null;

  sections = [
    {
      title: 'Electronics',
      categories: [
        { id: 1, name: 'Smartphones' },
        { id: 2, name: 'Laptops' },
        { id: 3, name: 'Audio & Headphones' },
        { id: 4, name: 'Accessories' }
      ]
    },
    {
      title: 'Clothing & Fashion',
      categories: [
        { id: 5, name: "Men's Wear" },
        { id: 6, name: "Women's Wear" },
        { id: 7, name: 'Shoes' },
        { id: 8, name: 'Bags' }
      ]
    },
    {
      title: 'Home & Living',
      categories: [
        { id: 9, name: 'Furniture' },
        { id: 10, name: 'Home Decor' },
        { id: 11, name: 'Kitchenware' },
        { id: 12, name: 'Bedding' }
      ]
    },
    {
      title: 'Hobbies & Art',
      categories: [
        { id: 13, name: 'Board Games' },
        { id: 14, name: 'Musical Instruments' },
        { id: 15, name: 'Art Supplies' },
        { id: 16, name: 'Video Games' }
      ]
    },
    {
      title: 'Beauty & Health',
      categories: [
        { id: 17, name: 'Skincare' },
        { id: 18, name: 'Cosmetics' },
        { id: 19, name: 'Hair Care' },
        { id: 20, name: 'Fragrances' }
      ]
    },
    {
      title: 'Sports',
      categories: [
        { id: 21, name: 'Fitness Gear' },
        { id: 22, name: 'Camping' },
        { id: 23, name: 'Cycling' },
        { id: 24, name: 'Sportswear' }
      ]
    }
  ];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    public tr: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories = [...data];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
  isAdmin(): boolean { return localStorage.getItem('role') === 'admin'; }

  getImageUrl(image: string): string {
    if (image.startsWith('http')) return image;
    return `http://127.0.0.1:8000${image}`;
  }

  onCategoryImageSelected(event: any) {
    this.selectedCategoryImage = event.target.files[0];
  }

  createCategory() {
    const formData = new FormData();
    formData.append('name', this.newCategory.name);
    formData.append('description', this.newCategory.description);
    if (this.selectedCategoryImage) {
      formData.append('image', this.selectedCategoryImage);
    }
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Token ${token}` });
    this.http.post('http://127.0.0.1:8000/api/categories/', formData, { headers }).subscribe({
      next: () => {
        this.showCategoryForm = false;
        this.newCategory = { name: '', description: '' };
        this.selectedCategoryImage = null;
        this.ngOnInit();
      },
      error: () => {}
    });
  }
}