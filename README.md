# 🛒 QuickCart — Mini E-Commerce Platform

> A full-stack mini e-commerce web application built with Angular and Django REST Framework. Browse products by category, manage a shopping cart, leave reviews, and switch between buyer and seller roles.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Frontend](#-frontend)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Team](#-team)

---

## 🌟 Overview

QuickCart is a full-stack web application where users can:

- **Register & Login** using Token-based authentication
- **Browse Products** across 12 categories with images, ratings, and discount badges
- **Search & Filter** products by name, category, or discount
- **Leave Reviews** with star ratings on product detail pages
- **Add to Cart** and place orders (buyer role)
- **List Products** for sale (seller role)
- **Manage Categories** with images (admin role)
- **Switch Language** between Russian and English

The system uses a monolithic Django backend with Django REST Framework, serving a single-page Angular frontend.

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | Django 5 + Django REST Framework 3 |
| Database | SQLite (development) |
| Auth | Token Authentication (`rest_framework.authtoken`) |
| Media | Django media files (Pillow) |
| CORS | `django-cors-headers` |
| Language | Python 3 |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Angular 17 |
| Language | TypeScript |
| Styling | CSS |
| HTTP Client | Angular HttpClient + Interceptors |
| Routing | Angular Router |
| i18n | Custom TranslateService (RU/EN signals) |

---

## ✨ Features

### Auth & Roles
- Token-based login and registration
- Three roles: **admin** (is_staff), **seller**, **buyer**
- Role is returned on login and stored in localStorage
- Role-based UI: admin sees delete + add, seller sees add only, buyer sees cart only

### Products
- 48 products across 12 categories
- Product images, descriptions, prices, discount percentage
- `discounted_price` and `avg_rating` computed fields on every product
- Search by name (`?search=`)
- Filter by category (`?category=id`) and discount (`?discount=true`)

### Categories
- 12 categories with cover images (Electronics, Clothing, Food, Sports, Home, Books, Beauty, Toys, Automotive, Garden, Health, Jewelry)
- Admin can add new categories with images directly from the UI

### Reviews
- Buyers can leave a star rating + comment on any product
- Average rating displayed on product cards and detail pages
- Only authenticated buyers can submit reviews

### Cart & Orders
- Buyers can add products to cart
- Cart persists in component state
- Orders can be placed via `POST /api/orders/`

### Localization
- Language toggle between 🇷🇺 Russian and 🇬🇧 English
- TranslateService built with Angular signals
- Navbar, cart, categories, and login pages translated

---

## 🏗️ Architecture

```
Angular SPA (localhost:4200)
        │
        │ HTTP + Token Auth
        ▼
Django REST Framework (localhost:8000)
        │
        ├── /api/auth/login/          FBV
        ├── /api/auth/register/       FBV
        ├── /api/products/            CBV (ListCreate)
        ├── /api/products/<pk>/       CBV (RetrieveUpdateDestroy)
        ├── /api/products/<pk>/reviews/  CBV (ListCreate)
        ├── /api/orders/              CBV (ListCreate)
        └── /api/categories/          CBV (List)
        │
        ▼
SQLite Database (db.sqlite3)
```

### Auth Flow

```
Client ──► POST /api/auth/login  { username, password }
Server ──► 200 { token, role, username }
Client stores token in localStorage
Angular interceptor ──► adds "Authorization: Token <token>" to every request
```

---

## 📡 API Reference

All protected routes require `Authorization: Token <token>` header.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login/` | No | Login, returns token + role |
| `POST` | `/api/auth/register/` | No | Register new user |

**Login Request/Response**:
```json
// POST /api/auth/login/
{ "username": "testbuyer", "password": "admin123" }

// 200 OK
{ "token": "abc123...", "role": "buyer", "username": "testbuyer" }
```

---

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products/` | No | List all products |
| `GET` | `/api/products/?search=iphone` | No | Search products |
| `GET` | `/api/products/?category=1` | No | Filter by category |
| `GET` | `/api/products/?discount=true` | No | Filter discounted only |
| `GET` | `/api/products/<id>/` | No | Product detail |
| `POST` | `/api/products/` | ✅ Seller/Admin | Create product |
| `DELETE` | `/api/products/<id>/` | ✅ Admin | Delete product |

**Product Response**:
```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "description": "Latest Apple flagship with titanium design and 48MP camera",
  "price": "450000.00",
  "discount": 0,
  "discounted_price": 450000.0,
  "image": "/media/products/download.jpeg",
  "category": 1,
  "seller": "testseller",
  "avg_rating": 4.5,
  "stock": 20
}
```

---

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products/<id>/reviews/` | No | Get reviews for product |
| `POST` | `/api/products/<id>/reviews/` | ✅ Buyer | Submit review |

**Review Request**:
```json
{ "rating": 5, "comment": "Great product!" }
```

---

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/categories/` | No | List all categories |
| `POST` | `/api/categories/` | ✅ Admin | Create category with image |

---

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/orders/` | ✅ | List user's orders |
| `POST` | `/api/orders/` | ✅ Buyer | Place an order |

---

## 🖥️ Frontend

Built with **Angular 17** using standalone components.

### Routes

| Route | Component | Auth Required |
|---|---|---|
| `/login` | `LoginComponent` | No |
| `/products` | `ProductsComponent` | No |
| `/products/:id` | `ProductDetailComponent` | No |
| `/categories` | `CategoriesComponent` | No |
| `/cart` | `CartComponent` | ✅ Buyer |

### Core Services

- **`ApiService`** — all HTTP calls to the backend
- **`TranslateService`** — RU/EN language switching via Angular signals
- **`AuthInterceptor`** — attaches `Authorization: Token` header automatically

### Role-Based UI

| Feature | Admin | Seller | Buyer |
|---|---|---|---|
| Add product | ✅ | ✅ | ❌ |
| Delete product | ✅ | ❌ | ❌ |
| Add category | ✅ | ❌ | ❌ |
| Add to cart | ❌ | ❌ | ✅ |
| Leave review | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and Angular CLI 17

### 1. Clone the repository

```bash
git clone https://github.com/erasylmurat/web-dev-project.git
cd web-dev-project
```

### 2. Start the Backend

```bash
cd backend
python3 -m venv ../backend-venv
source ../backend-venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver
# Backend available at http://localhost:8000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
ng serve
# Frontend available at http://localhost:4200
```

### 4. Default Users

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin (is_staff) |
| `testbuyer` | `admin123` | Buyer |
| `testseller` | `admin123` | Seller |

---

## 📁 Project Structure

```
web-dev-project/
├── .gitignore
├── README.md
├── postman_collection.json          # Postman collection (8 requests)
│
├── backend/
│   ├── manage.py
│   ├── db.sqlite3                   # SQLite database
│   ├── requirements.txt
│   ├── media/
│   │   ├── products/                # Product images
│   │   └── categories/              # Category images
│   ├── quickcart/                   # Django project settings
│   │   ├── settings.py
│   │   └── urls.py
│   └── store/                       # Main Django app
│       ├── models.py                # Category, Product, Order, OrderItem, UserProfile, Review
│       ├── serializers.py           # 6 serializers (2x Serializer, 4x ModelSerializer)
│       ├── views.py                 # 2 FBV (login, register) + 4 CBV
│       ├── urls.py
│       └── admin.py
│
└── frontend/
    ├── angular.json
    ├── package.json
    └── src/
        ├── styles.css               # Global styles (dark navy + red accent theme)
        └── app/
            ├── app.config.ts
            ├── app.routes.ts
            ├── interceptors/
            │   └── auth-interceptor.ts
            ├── services/
            │   ├── api.ts           # All HTTP calls
            │   └── translate.ts     # RU/EN localization
            └── components/
                ├── login/
                ├── products/
                ├── product-detail/
                ├── categories/
                └── cart/
```

---

## 👥 Team

| Name | GitHub |
|---|---|
| Мұрат Ерасыл | [@erasylmurat](https://github.com/erasylmurat) |
| Мырзалы Нурали | [@Nurali-852](https://github.com/Nurali-852) |

---

## 📄 License

This project was built as a university course assignment at KBTU.
