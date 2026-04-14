import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  email = '';
  errorMessage = '';
  isRegister = false;

  constructor(private api: ApiService, private router: Router) {}

  login() {
    this.api.login(this.username, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        this.router.navigate(['/products']);
      },
      error: () => {
        this.errorMessage = 'Неверный логин или пароль';
      }
    });
  }

  register() {
    this.api.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        this.router.navigate(['/products']);
      },
      error: () => {
        this.errorMessage = 'Ошибка регистрации';
      }
    });
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.errorMessage = '';
  }
}