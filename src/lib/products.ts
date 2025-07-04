export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  dataAiHint: string;
};

export const products: Product[] = [
    { id: 'tiramisu_nutella', name: 'Tiramisù Nutella', price: 35, image: 'https://placehold.co/600x400.png', dataAiHint: 'tiramisu nutella' },
    { id: 'tiramisu_white_chocolate', name: 'Tiramisù White Chocolate', price: 35, image: 'https://placehold.co/600x400.png', dataAiHint: 'tiramisu white chocolate' },
    { id: 'tiramisu_lotus', name: 'Tiramisù Lotus', price: 35, image: 'https://placehold.co/600x400.png', dataAiHint: 'tiramisu lotus' },
    { id: 'tiramisu_pistachio', name: 'Tiramisù Pistachio', price: 45, image: 'https://placehold.co/600x400.png', dataAiHint: 'tiramisu pistachio' },
];
