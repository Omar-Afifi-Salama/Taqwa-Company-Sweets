"use server";

import { redirect } from 'next/navigation';
import { products } from '@/lib/products';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export async function submitOrder(formData: FormData) {
    if (!db) {
        return { error: "The application's backend is not configured correctly. Please contact support." };
    }

    const name = formData.get('name') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const roomNumber = formData.get('roomNumber') as string;
    const paymentConfirmed = formData.get('paymentConfirmation') === 'true';

    if (!paymentConfirmed) {
        return { error: 'You must confirm that you have sent payment.' };
    }
    
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

    try {
        const counterRef = doc(db, "counters", "orderNumber");
        const newOrderRef = doc(collection(db, "orders"));

        const orderNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            
            let newCount = 1;
            if (counterDoc.exists()) {
                const currentCount = counterDoc.data().current;
                newCount = currentCount >= 99 ? 1 : currentCount + 1;
            }
            
            transaction.set(counterRef, { current: newCount });

            transaction.set(newOrderRef, {
                name,
                phoneNumber,
                roomNumber,
                items: orderedItems,
                total: serverTotal,
                orderNumber: newCount,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            
            return newCount;
        });
        
        const queryParams = new URLSearchParams({
            name,
            phone: phoneNumber,
            room: roomNumber,
            total: String(serverTotal),
            items: JSON.stringify(orderedItems),
            orderNumber: String(orderNumber).padStart(2, '0'),
        });

        redirect(`/confirmation?${queryParams.toString()}`);

    } catch (e) {
        console.error("Error adding document: ", e);
        return { error: 'Could not save your order. Please try again later.' };
    }
}
