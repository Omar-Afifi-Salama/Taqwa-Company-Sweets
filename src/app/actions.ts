"use server";

import { redirect } from 'next/navigation';
import { products } from '@/lib/products';
import { db, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export async function submitOrder(formData: FormData) {
    if (!db || !storage) {
        return { error: "The application's backend is not configured correctly. Please contact support." };
    }

    const name = formData.get('name') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const roomNumber = formData.get('roomNumber') as string;
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

    if (!receiptFile || receiptFile.size === 0) {
        return { error: 'A receipt is required as proof of payment.' };
    }

    let receiptUrl = '';
    try {
        const storageRef = ref(storage, `receipts/${Date.now()}_${receiptFile.name}`);
        const snapshot = await uploadBytes(storageRef, receiptFile);
        receiptUrl = await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error("Error uploading receipt: ", error);
        return { error: 'There was an error uploading your receipt. Please try again.' };
    }


    try {
        await addDoc(collection(db, "orders"), {
            name,
            phoneNumber,
            roomNumber,
            items: orderedItems,
            total: serverTotal,
            receiptUrl: receiptUrl,
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
    });

    redirect(`/confirmation?${queryParams.toString()}`);
}
