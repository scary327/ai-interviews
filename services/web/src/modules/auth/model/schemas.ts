import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Введите корректный email"),
    password: z.string().min(1, "Введите пароль")
});

export const registerSchema = z
    .object({
        name: z.string().trim().min(2, "Минимум 2 символа"),
        email: z.email("Введите корректный email"),
        password: z.string().min(8, "Минимум 8 символов"),
        confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Пароли не совпадают",
        path: ["confirmPassword"]
    });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
