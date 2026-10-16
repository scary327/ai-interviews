import { Link } from "@tanstack/react-router";
import { BrainCircuitIcon, ChartNoAxesColumnIcon, MessagesSquareIcon } from "lucide-react";

import { Logo } from "@/shared/components/Logo";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const FEATURES = [
    {
        icon: MessagesSquareIcon,
        title: "Живой диалог",
        text: "Интервьюер задаёт уточняющие вопросы, как на настоящем собеседовании"
    },
    {
        icon: BrainCircuitIcon,
        title: "Под вашу позицию",
        text: "Java, Python, фронтенд, QA — выбирайте стек, уровень и темы"
    },
    {
        icon: ChartNoAxesColumnIcon,
        title: "Разбор после",
        text: "Оценка, сильные стороны и что подтянуть к следующему разу"
    }
];

export const LandingPage = () => (
    <div className="flex min-h-svh flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between p-4">
            <Logo />
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" asChild>
                    <Link to="/login">Войти</Link>
                </Button>
            </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 px-4 py-16 text-center">
            <div className="max-w-2xl space-y-6">
                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                    Тренируйте собеседования с ИИ-интервьюером
                </h1>
                <p className="text-lg text-balance text-muted-foreground">
                    Без стресса и в любое время. Получайте честный фидбек и следите за прогрессом.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button size="lg" asChild>
                        <Link to="/register">Попробовать бесплатно</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link to="/login">У меня есть аккаунт</Link>
                    </Button>
                </div>
            </div>

            <div className="grid w-full gap-4 text-left md:grid-cols-3">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                    <Card key={title}>
                        <CardHeader>
                            <Icon className="mb-2 size-6 text-muted-foreground" />
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{text}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </main>
    </div>
);
