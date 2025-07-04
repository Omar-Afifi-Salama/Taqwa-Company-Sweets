"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";

import type { Product } from "@/lib/products";
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
import { isFirebaseConfigured } from "@/lib/firebase";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  tiramisu_nutella: z.coerce.number().int().min(0).default(0),
  tiramisu_white_chocolate: z.coerce.number().int().min(0).default(0),
  tiramisu_lotus: z.coerce.number().int().min(0).default(0),
  tiramisu_pistachio: z.coerce.number().int().min(0).default(0),
  name: z.string().min(1, { message: "Name is required." }),
  phoneNumber: z.string().regex(/^01[0125][0-9]{8}$/, { message: "Please enter a valid 11-digit Egyptian phone number." }),
  roomNumber: z.string().length(3, {message: "Room number must be 3 digits."}).regex(/^[0-9]+$/, { message: "Only numbers are allowed." }),
  paymentConfirmation: z.boolean().refine((val) => val === true, {
    message: "You must confirm payment before placing the order.",
  }),
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
      tiramisu_pistachio: 0,
      name: "",
      phoneNumber: "",
      roomNumber: "",
      paymentConfirmation: false,
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

  const onSubmit = (data: OrderFormValues) => {
    const formData = new FormData();
    let hasItems = false;
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
        if (products.some(p => p.id === key) && Number(value) > 0) {
          hasItems = true;
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
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden flex flex-col">
                            <div className="p-4 space-y-4 flex flex-col flex-grow">
                                <FormField
                                    control={form.control}
                                    name={product.id as keyof OrderFormValues}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col flex-grow">
                                            <div className="flex justify-between items-baseline">
                                                <FormLabel className="text-lg font-semibold">{product.name}</FormLabel>
                                                <p className="text-primary font-bold">{product.price} EGP</p>
                                            </div>
                                            <div className="mt-auto pt-4">
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-10 w-10 shrink-0"
                                                        onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input {...field} type="number" min="0" className="text-center" onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        field.onChange(isNaN(val) ? 0 : val);
                                                    }} />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-10 w-10 shrink-0"
                                                        onClick={() => field.onChange((field.value || 0) + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    </div>
                                                </FormControl>
                                            </div>
                                            <FormMessage className="pt-2"/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>
                    ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input placeholder="01xxxxxxxxx" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                            <Input placeholder="302" type="text" inputMode="numeric" maxLength={3} {...field} />
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
                        <li>Send a screenshot of the transaction confirmation via WhatsApp to the same number.</li>
                        <li>Check the box below to confirm you've paid and sent the receipt.</li>
                    </ol>
                    </div>
                    <FormField
                    control={form.control}
                    name="paymentConfirmation"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            I confirm I have sent the payment and receipt screenshot via WhatsApp.
                            </FormLabel>
                             <FormMessage />
                        </div>
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>
        </fieldset>

        <Card className="sticky bottom-0 shadow-2xl">
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
