import { OrderForm } from '@/components/order-form';
import { products } from '@/lib/products';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function Home() {
  const firebaseConfigured = isFirebaseConfigured();

  return (
    <main className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-primary font-headline">Taqwa Company Sweets</h1>
        <p className="text-2xl text-muted-foreground mt-2 font-headline">Your one-stop shop for delicious treats!</p>
      </header>
      {!firebaseConfigured && (
        <Alert variant="destructive" className="mb-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Backend Not Configured</AlertTitle>
          <AlertDescription>
            This app is not connected to a backend database, so orders cannot be processed. Please add your Firebase configuration to proceed.
          </AlertDescription>
        </Alert>
      )}
      <OrderForm products={products} />
    </main>
  );
}
