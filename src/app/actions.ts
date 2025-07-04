"use server";

import { redirect } from 'next/navigation';
import { products, Product } from '@/lib/products';

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export async function submitOrder(formData: FormData) {
    const dormNumber = formData.get('dormNumber') as string;
    const receiptFile = formData.get('receipt') as File | null;
    
    const orderedItems: OrderItem[] = [];
    let serverTotal = 0;

    products.forEach(product => {
        const quantity = Number(formData.get(product.id));
        if (quantity > 0) {
            orderedItems.push({
                id: product.id,
                name: product.name,
                quantity: quantity,
                price: product.price
            });
            serverTotal += quantity * product.price;
        }
    });

    if (orderedItems.length === 0) {
        return { error: 'No items were selected.' };
    }

    // Here you would typically save the order to a database
    // and upload the receipt file to a storage service.
    // For this demo, we'll just log it.

    console.log("--- New Order Received ---");
    console.log("Dorm Number:", dormNumber);
    console.log("Items:", orderedItems);
    console.log("Total:", serverTotal);
    console.log("Receipt Uploaded:", !!receiptFile && receiptFile.size > 0);
    console.log("--------------------------");
    
    const queryParams = new URLSearchParams({
        dorm: dormNumber,
        total: String(serverTotal),
        items: JSON.stringify(orderedItems),
    });

    redirect(`/confirmation?${queryParams.toString()}`);
}
