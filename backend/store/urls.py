from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('products/', views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/reviews/', views.ReviewListCreateView.as_view(), name='review-list'),
    path('orders/', views.OrderListCreateView.as_view(), name='order-list'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
]