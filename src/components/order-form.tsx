"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";

import type { Product } from "@/lib/products";
import { products } from "@/lib/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitOrder } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { isFirebaseConfigured } from "@/lib/firebase";

const formSchema = z.object({
  tiramisu_nutella: z.coerce.number().int().min(0).default(0),
  tiramisu_white_chocolate: z.coerce.number().int().min(0).default(0),
  tiramisu_lotus: z.coerce.number().int().min(0).default(0),
  tiramisu_kit_kat: z.coerce.number().int().min(0).default(0),
  dormNumber: z.string().min(1, { message: "Dorm number is required." }).regex(/^[0-9]+$/, { message: "Only numbers are allowed." }),
  receipt: z.any()
    .refine((files) => files?.length >= 1, "Receipt image is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["image/jpeg", "image/png", "image/jpg"].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, and .png formats are supported."
    ),
});

type OrderFormValues = z.infer<typeof formSchema>;

export function OrderForm({ products }: { products: Product[] }) {
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firebaseConfigured = isFirebaseConfigured();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tiramisu_nutella: 0,
      tiramisu_white_chocolate: 0,
      tiramisu_lotus: 0,
      tiramisu_kit_kat: 0,
      dormNumber: "",
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    const newTotal = products.reduce((acc, product) => {
      const quantity = watchedValues[product.id as keyof OrderFormValues] as number || 0;
      return acc + quantity * product.price;
    }, 0);
    setTotal(newTotal);
  }, [watchedValues, products]);

  const receiptRef = form.register("receipt");

  const onSubmit = (data: OrderFormValues) => {
    const formData = new FormData();
    let hasItems = false;
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'receipt' && value && value.length > 0) {
        formData.append(key, value[0]);
      } else if (key !== 'receipt') {
        formData.append(key, String(value));
        if (products.some(p => p.id === key) && Number(value) > 0) {
          hasItems = true;
        }
      }
    });

    if (!hasItems) {
        toast({
            variant: "destructive",
            title: "No items in cart",
            description: "Please select at least one item to order.",
        });
        return;
    }

    startTransition(async () => {
      const result = await submitOrder(formData);
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Order failed",
          description: result.error,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={!firebaseConfigured} className="space-y-8">
            <Card>
            <CardHeader>
                <CardTitle>Create Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                    <FormField
                    key={product.id}
                    control={form.control}
                    name={product.id as keyof OrderFormValues}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex justify-between items-center">
                            <span>{product.name}</span>
                            <span className="text-muted-foreground font-normal">{product.price} EGP</span>
                        </FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => field.onChange(Math.max(0, field.value - 1))}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input {...field} type="number" min="0" className="text-center" />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => field.onChange(field.value + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                ))}
                </div>
                <Separator />
                <FormField
                control={form.control}
                name="dormNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Dorm Number</FormLabel>
                    <FormControl>
                        <Input placeholder="302" type="text" inputMode="numeric" pattern="[0-9]*" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <p className="font-semibold">Instructions:</p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Calculate your total bill below.</li>
                    <li>Send the total amount via Vodafone Cash to <strong className="text-primary">01127494696</strong>.</li>
                    <li>Take a screenshot of the transaction confirmation.</li>
                    <li>Upload the screenshot below as proof of payment.</li>
                </ol>
                </div>
                <FormField
                control={form.control}
                name="receipt"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Upload Receipt Screenshot</FormLabel>
                    <FormControl>
                        <Input type="file" {...receiptRef} />
                    </FormControl>
                    <FormDescription>
                        Please upload the screenshot of your Vodafone Cash transaction.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
            </Card>
        </fieldset>

        <Card className="sticky bottom-0">
          <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Total Bill</p>
                <p className="text-3xl font-bold text-primary">{total} EGP</p>
              </div>
            <Button type="submit" size="lg" disabled={isPending || total === 0 || !firebaseConfigured}>
              {isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
