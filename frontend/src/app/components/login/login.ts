import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate';

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
  selectedRole = 'buyer';

  constructor(private api: ApiService, private router: Router, public tr: TranslateService) {}

  login() {
  this.api.login(this.username, this.password).subscribe({
    next: (res) => {
      this.api.saveUserData(res);
      this.router.navigate(['/products']);
    },
    error: () => {
      this.errorMessage = 'Неверный логин или пароль';
    }
  });
  }

  register() {
    this.api.register(this.username, this.email, this.password, this.selectedRole).subscribe({
      next: (res) => {
        this.api.saveUserData(res);
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