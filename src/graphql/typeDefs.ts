export const typeDefs = `#graphql
  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Image {
    url: String!
    public_id: String
  }

  type Review {
    id: ID!
    user: User
    product: Product
    rating: Int!
    comment: String!
    createdAt: Date
  }

  type Product {
    id: ID!
    _id: ID!
    name: String!
    slug: String
    description: String
    price: Float!
    discount: Float
    category: String
    brand: String
    stock: Int
    countInStock: Int
    images: [Image!]!
    image: String
    ratings: Float
    numReviews: Int
    tags: [String!]
    isActive: Boolean
    isFeatured: Boolean
    badge: String
    reviews: [Review!]
    createdAt: Date
  }

  type ProductConnection {
    items: [Product!]!
    total: Int!
    limit: Int!
    skip: Int!
    hasMore: Boolean!
  }

  type CartItem {
    product: Product
    quantity: Int!
    price: Float!
    name: String
    image: String
  }

  type Cart {
    id: ID!
    user: User
    items: [CartItem!]!
    totalItems: Int!
    totalPrice: Float!
    currency: String!
  }

  type OrderItem {
    product: Product
    productId: String
    name: String!
    quantity: Int!
    price: Float!
    image: String
  }

  type ShippingAddress {
    address: String!
    city: String
    pincode: String
    country: String
  }

  type Order {
    id: ID!
    _id: ID!
    user: User
    items: [OrderItem!]!
    status: String!
    totalAmount: Float!
    totalPrice: Float
    currency: String
    shippingAddress: ShippingAddress
    createdAt: Date
  }

  type Wishlist {
    id: ID!
    user: User
    products: [Product!]!
  }

  type AuthPayload {
    user: User!
    token: String!
    accessToken: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ShippingAddressInput {
    address: String!
    city: String
    pincode: String
    country: String
  }

  input ProductFiltersInput {
    search: String
    category: String
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    limit: Int
    skip: Int
  }

  type Query {
    getProducts(filters: ProductFiltersInput): ProductConnection!
    getProductById(id: ID!): Product
    getCart: Cart
    getOrders: [Order!]!
    getWishlist: Wishlist
  }

  type Mutation {
    registerUser(input: RegisterInput!): AuthPayload!
    loginUser(input: LoginInput!): AuthPayload!
    addToCart(productId: ID!, quantity: Int! = 1): Cart!
    updateCartQuantity(productId: ID!, quantity: Int!): Cart!
    removeFromCart(productId: ID!): Cart
    placeOrder(shippingAddress: ShippingAddressInput!, paymentMethod: String! = "cod"): Order!
    addToWishlist(productId: ID!): Wishlist!
    removeFromWishlist(productId: ID!): Wishlist
    deleteOrder(id: ID!): Order!
  }
`;
