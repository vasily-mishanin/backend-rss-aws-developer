export type ShopProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  thumbnail: string;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
};

export interface IProduct {
  id?: string;
  title: string;
  price: number;
  description: string;
  thumbnail: string;
  count: number;
}
