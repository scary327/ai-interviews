import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { RegisterPage } from "@/pages/register/RegisterPage";

export const Route = createFileRoute("/_guest/register")({
    component: RegisterRoute
});

function RegisterRoute() {
    const navigate = useNavigate();
    return <RegisterPage onSuccess={() => void navigate({ to: "/interviews/new" })} />;
}
