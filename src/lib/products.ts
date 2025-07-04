export type Product = {
  id: string;
  name: string;
  price: number;
};

export const products: Product[] = [
    { id: 'tiramisu_nutella', name: 'Tiramisù Nutella', price: 35 },
    { id: 'tiramisu_white_chocolate', name: 'Tiramisù White Chocolate', price: 35 },
    { id: 'tiramisu_lotus', name: 'Tiramisù Lotus', price: 35 },
    { id: 'tiramisu_pistachio', name: 'Tiramisù Pistachio', price: 45 },
];
