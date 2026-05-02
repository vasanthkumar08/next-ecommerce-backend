export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  countInStock?: number;
  rating: {
    rate: number;
    count: number;
  };
}
