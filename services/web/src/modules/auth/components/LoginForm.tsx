import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getErrorMessage } from "@/shared/lib/errors";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";

import { useSignIn } from "../hooks/use-auth-mutations";
import { loginSchema, type LoginValues } from "../model/schemas";

interface LoginFormProps {
    onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const signIn = useSignIn();
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });
    const { errors } = form.formState;

    const onSubmit = form.handleSubmit((data) => signIn.mutate({ data }, { onSuccess }));

    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
                {signIn.isError && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {getErrorMessage(signIn.error, "Неверный email или пароль")}
                        </AlertDescription>
                    </Alert>
                )}

                <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        {...form.register("email")}
                    />
                    <FieldError errors={[errors.email]} />
                </Field>

                <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password">Пароль</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={!!errors.password}
                        {...form.register("password")}
                    />
                    <FieldError errors={[errors.password]} />
                </Field>

                <Button type="submit" disabled={signIn.isPending}>
                    {signIn.isPending && <Spinner />}
                    Войти
                </Button>
            </FieldGroup>
        </form>
    );
};
