import { OrderForm } from '@/components/order-form';
import { products } from '@/lib/products';

export default function Home() {
  return (
    <main className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-primary font-headline">Taqwa HQ</h1>
        <p className="text-2xl text-muted-foreground mt-2 font-headline">الموقع الرسمي لشركة التقوى</p>
      </header>
      <OrderForm products={products} />
    </main>
  );
}
