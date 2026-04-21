from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem, UserProfile, Review


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=['buyer', 'seller'])

    def create(self, validated_data):
        role = validated_data.pop('role', 'buyer')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user, role=role)
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'discounted_price',
            'category', 'category_name', 'seller_name', 'image',
            'discount', 'reviews', 'avg_rating', 'created_at'
        ]

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_discounted_price(self, obj):
        if obj.discount > 0:
            return round(float(obj.price) * (1 - obj.discount / 100), 2)
        return float(obj.price)


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'created_at', 'username', 'items']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'role']