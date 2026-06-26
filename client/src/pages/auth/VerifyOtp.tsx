import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthStore } from "@/store/authStore";

const verifySchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyOtp() {
    const [location, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    // Extract email and role from query params
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const { login } = useAuthStore();
    useEffect(() => {
        if (!email) {
            toast({
                title: "Error",
                description: "Email is missing. Please login or register again.",
                variant: "destructive",
            });
            setLocation("/login");
        }
    }, [email, setLocation, toast]);

    const form = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            otp: "",
        },
    });

    const verifyMutation = useMutation({
        mutationFn: async (data: VerifyFormValues) => {
            const payload: any = {
                email,
                otp: data.otp,
            };
            if (role) {
                payload.role = role;
            }
            const res = await apiRequest("POST", "/api/auth/verify", payload);
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: "You have successfully verified your account.",
            });
            // Invalidate auth query to update user state
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            console.log("Verification successful:", data);
            // Redirect based on role
            const role = data?.data?.user?.role;
            const token = data?.data?.token;
            const user = data?.data?.user;
            if (user && token) {
                login(user, token);
            }
            if (role === "seller") {
                setLocation("/seller");
            } else if (role === "admin") {
                setLocation("/admin");
            } else {
                setLocation("/");
            }
        },
        onError: (error: Error) => {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = async (data: VerifyFormValues) => {
        setIsLoading(true);
        try {
            await verifyMutation.mutateAsync(data);
        } catch (error) {
            // Already handled by onError in verifyMutation
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header showSearch={false} />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            Verify OTP
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter the 6-digit code sent to {email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col items-center">
                                            <FormLabel className="sr-only">OTP</FormLabel>
                                            <FormControl>
                                                <InputOTP maxLength={6} {...field}>
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={0} />
                                                        <InputOTPSlot index={1} />
                                                        <InputOTPSlot index={2} />
                                                        <InputOTPSlot index={3} />
                                                        <InputOTPSlot index={4} />
                                                        <InputOTPSlot index={5} />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button className="w-full" type="submit" disabled={isLoading}>
                                    {isLoading ? "Verifying..." : "Verify"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
