import { ErrorState } from "@/shared/components/ErrorState";
import { useGetMe } from "@/shared/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Данные профиля. Пока только чтение: в core-api нет PATCH /users/me.
 * Когда появится — форма по аналогии с InterviewSetupForm + useUpdateMe из Orval.
 */
export const ProfileCard = () => {
    const { data: user, isPending, error, refetch } = useGetMe();

    if (isPending) return <Skeleton className="h-64" />;
    if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Личные данные</CardTitle>
                <CardDescription>Используются интервьюером, чтобы обращаться к вам</CardDescription>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="profile-name">Имя</FieldLabel>
                        <Input id="profile-name" value={user.name ?? ""} readOnly />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                        <Input id="profile-email" value={user.email} readOnly />
                        <FieldDescription>Редактирование профиля появится позже</FieldDescription>
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
    );
};
