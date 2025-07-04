import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, MessageSquareText } from 'lucide-react';

export const runtime = 'edge';

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

function ConfirmationContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const total = searchParams.total ? Number(searchParams.total) : 0;
    const name = searchParams.name as string || 'N/A';
    const phone = searchParams.phone as string || 'N/A';
    const room = searchParams.room as string || 'N/A';
    const orderNumber = searchParams.orderNumber as string || 'N/A';
    let items: OrderItem[] = [];
    try {
        items = searchParams.items ? JSON.parse(searchParams.items as string) : [];
    } catch (error) {
        console.error("Failed to parse items from query params", error);
    }

    return (
        <main className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
            <Card className="w-full">
                <CardHeader className="items-center text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
                    <CardDescription>Thank you for your order, {name}. Please follow the final step below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
                        <MessageSquareText className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">Your Order Number is:</h3>
                        <p className="text-6xl font-extrabold text-primary my-2">{orderNumber}</p>
                        <p className="text-muted-foreground">
                            Please send this <span className="font-semibold text-foreground">Order Number</span> via WhatsApp to <strong className="text-primary">01127494696</strong> to finalize your order.
                        </p>
                    </div>

                    <Separator />
                    <div className="space-y-2">
                        <h3 className="font-semibold">Order Summary</h3>
                        <p><span className="text-muted-foreground">Name:</span> {name}</p>
                        <p><span className="text-muted-foreground">Phone Number:</span> {phone}</p>
                        <p><span className="text-muted-foreground">Room / Delivery Address:</span> {room}</p>
                    </div>
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} x {item.price} EGP
                                    </p>
                                </div>
                                <p className="font-medium">{item.quantity * item.price} EGP</p>
                            </div>
                        ))}
                    </div>
                    <Separator />
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/50 p-6 rounded-b-lg">
                    <p className="text-lg font-bold">Total Paid</p>
                    <p className="text-2xl font-bold text-primary">{total} EGP</p>
                </CardFooter>
            </Card>
        </main>
    );
}


export default function ConfirmationPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
        <Suspense fallback={<div>Loading receipt...</div>}>
            <ConfirmationContent searchParams={searchParams} />
        </Suspense>
    );
}
