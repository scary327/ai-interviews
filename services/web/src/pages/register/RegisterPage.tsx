import { Link } from "@tanstack/react-router";

import { RegisterForm } from "@/modules/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export const RegisterPage = ({ onSuccess }: { onSuccess: () => void }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl">Регистрация</CardTitle>
            <CardDescription>Пара полей — и можно начинать первое собеседование</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <RegisterForm onSuccess={onSuccess} />
            <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link to="/login" className="text-foreground underline underline-offset-4">
                    Войти
                </Link>
            </p>
        </CardContent>
    </Card>
);
