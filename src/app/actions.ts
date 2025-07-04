"use server";

import { redirect } from 'next/navigation';
import { products } from '@/lib/products';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    const orderNumber = Math.floor(10 + Math.random() * 90);

    try {
        await addDoc(collection(db, "orders"), {
            name,
            phoneNumber,
            roomNumber,
            items: orderedItems,
            total: serverTotal,
            orderNumber: orderNumber,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error adding document: ", e);
        return { error: 'Could not save your order. Please try again later.' };
    }

    
    const queryParams = new URLSearchParams({
        name,
        phone: phoneNumber,
        room: roomNumber,
        total: String(serverTotal),
        items: JSON.stringify(orderedItems),
        orderNumber: String(orderNumber),
    });

    redirect(`/confirmation?${queryParams.toString()}`);
}
