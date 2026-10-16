import { Link } from "@tanstack/react-router";

import { Button } from "@/shared/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/ui/empty";

export const NotFoundPage = () => (
    <div className="flex min-h-svh items-center justify-center p-4">
        <Empty>
            <EmptyHeader>
                <EmptyTitle className="text-5xl font-bold">404</EmptyTitle>
                <EmptyDescription>Такой страницы нет</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button asChild>
                    <Link to="/">На главную</Link>
                </Button>
            </EmptyContent>
        </Empty>
    </div>
);
