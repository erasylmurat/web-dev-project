import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Products } from './components/products/products';
import { Cart } from './components/cart/cart';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'products', component: Products },
  { path: 'cart', component: Cart },
];