import { Spinner } from "@/shared/ui/spinner";

export const FullPageSpinner = () => (
    <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
    </div>
);
