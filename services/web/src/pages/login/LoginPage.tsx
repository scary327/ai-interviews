import { Link } from "@tanstack/react-router";

import { LoginForm } from "@/modules/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export const LoginPage = ({ onSuccess }: { onSuccess: () => void }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl">Вход</CardTitle>
            <CardDescription>Продолжите тренировку собеседований</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <LoginForm onSuccess={onSuccess} />
            <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link to="/register" className="text-foreground underline underline-offset-4">
                    Зарегистрироваться
                </Link>
            </p>
        </CardContent>
    </Card>
);
