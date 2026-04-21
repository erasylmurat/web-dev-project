import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { Order } from '../../models/order';
import { TranslateService } from '../../services/translate';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private api: ApiService, 
    public tr: TranslateService, 
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.api.getOrders().subscribe({
      next: (data) => {
        this.orders = data.sort((a, b) => 
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        );
        this.loading = false;
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Ошибка:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTotalPrice(order: Order): number {
    return order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  }
}