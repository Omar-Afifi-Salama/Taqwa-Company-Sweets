export type Product = {
  id: string;
  name: string;
  price: number;
};

export const products: Product[] = [
    { id: 'nutella', name: 'Nutella', price: 45 },
    { id: 'white_chocolate', name: 'White Chocolate', price: 45 },
    { id: 'lotus', name: 'Lotus', price: 45 },
    { id: 'kit_kat', name: 'Kit-Kat', price: 40 },
    { id: 'caramel', name: 'Caramel', price: 40 },
    { id: 'brownie', name: 'Brownie', price: 35 },
];
