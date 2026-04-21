import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Products } from './components/products/products';
import { Cart } from './components/cart/cart';
import { ProductDetail } from './components/product-detail/product-detail';
import { Categories } from './components/categories/categories';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'categories', component: Categories },
  { path: 'cart', component: Cart },
  { path: 'profile', component: Profile },
];