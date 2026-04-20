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