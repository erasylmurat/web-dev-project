from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Category, Product, Order, OrderItem, Review
from .serializers import (
    LoginSerializer, RegisterSerializer,
    CategorySerializer, ProductSerializer,
    OrderSerializer, OrderItemSerializer, ReviewSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            role = 'admin' if user.is_staff else getattr(getattr(user, 'profile', None), 'role', 'buyer')
            return Response({'token': token.key, 'username': user.username, 'role': role})
        return Response({'error': 'Неверный логин или пароль'}, status=400)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        role = getattr(getattr(user, 'profile', None), 'role', 'buyer')
        return Response({'token': token.key, 'username': user.username, 'role': role}, status=201)
    return Response(serializer.errors, status=400)


class ProductListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category_id = request.query_params.get('category')
        search = request.query_params.get('search')
        discount = request.query_params.get('discount')
        products = Product.objects.all()
        if category_id:
            products = products.filter(category_id=category_id)
        if search:
            products = products.filter(name__icontains=search)
        if discount == 'true':
            products = products.filter(discount__gt=0)
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Требуется авторизация'}, status=401)
        role = 'admin' if request.user.is_staff else getattr(getattr(request.user, 'profile', None), 'role', 'buyer')
        if role not in ['admin', 'seller']:
            return Response({'error': 'Нет прав'}, status=403)
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(seller=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        serializer = ProductSerializer(product, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        if not request.user.is_staff:
            return Response({'error': 'Нет прав'}, status=403)
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        product.delete()
        return Response(status=204)


class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        order = Order.objects.create(user=request.user)
        items_data = request.data.get('items', [])
        for item in items_data:
            product = Product.objects.get(pk=item['product_id'])
            OrderItem.objects.create(
                order=order, product=product,
                quantity=item['quantity'], price=product.price
            )
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ReviewListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        reviews = Review.objects.filter(product_id=pk)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Требуется авторизация'}, status=401)
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        purchase_count = OrderItem.objects.filter(
            order__user=request.user,
            product=product
        ).count()

        if purchase_count == 0:
            return Response({'error': 'Вы можете оставить отзыв только после покупки'}, status=403)

        review_count = Review.objects.filter(
            user=request.user,
            product=product
        ).count()

        if review_count >= purchase_count:
            return Response({'error': 'Вы уже оставили максимальное количество отзывов'}, status=403)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, product=product)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)