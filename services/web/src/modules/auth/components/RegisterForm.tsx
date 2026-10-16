import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getErrorMessage } from "@/shared/lib/errors";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";

import { useSignUp } from "../hooks/use-auth-mutations";
import { registerSchema, type RegisterValues } from "../model/schemas";

interface RegisterFormProps {
    onSuccess: () => void;
}

const FIELDS = [
    { name: "name", label: "Имя", type: "text", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "password", label: "Пароль", type: "password", autoComplete: "new-password" },
    {
        name: "confirmPassword",
        label: "Повторите пароль",
        type: "password",
        autoComplete: "new-password"
    }
] as const;

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const signUp = useSignUp();
    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" }
    });
    const { errors } = form.formState;

    const onSubmit = form.handleSubmit(({ name, email, password }) =>
        signUp.mutate({ data: { name, email, password } }, { onSuccess })
    );

    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
                {signUp.isError && (
                    <Alert variant="destructive">
                        <AlertDescription>{getErrorMessage(signUp.error)}</AlertDescription>
                    </Alert>
                )}

                {FIELDS.map(({ name, label, ...input }) => (
                    <Field key={name} data-invalid={!!errors[name]}>
                        <FieldLabel htmlFor={name}>{label}</FieldLabel>
                        <Input
                            id={name}
                            aria-invalid={!!errors[name]}
                            {...input}
                            {...form.register(name)}
                        />
                        <FieldError errors={[errors[name]]} />
                    </Field>
                ))}

                <Button type="submit" disabled={signUp.isPending}>
                    {signUp.isPending && <Spinner />}
                    Создать аккаунт
                </Button>
            </FieldGroup>
        </form>
    );
};
