export type Product = {
  id: string;
  name: string;
  price: number;
};

export const products: Product[] = [
    { id: 'chicken_shawarma', name: 'Chicken Shawarma', price: 50 },
    { id: 'beef_burger', name: 'Beef Burger', price: 60 },
    { id: 'koshary', name: 'Koshary', price: 30 },
    { id: 'fries', name: 'Fries', price: 20 },
    { id: 'cola', name: 'Cola', price: 15 },
    { id: 'water', name: 'Water', price: 10 },
];
