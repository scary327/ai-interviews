import { useQueryClient } from "@tanstack/react-query";
import { FlagIcon } from "lucide-react";
import { toast } from "sonner";

import {
    getGetInterviewQueryKey,
    getListInterviewsQueryKey,
    useFinishInterview
} from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errors";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

interface FinishInterviewButtonProps {
    interviewId: string;
    onFinished: () => void;
}

export const FinishInterviewButton = ({ interviewId, onFinished }: FinishInterviewButtonProps) => {
    const queryClient = useQueryClient();
    const finish = useFinishInterview({
        mutation: {
            onSuccess: async () => {
                await Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: getGetInterviewQueryKey(interviewId)
                    }),
                    queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey() })
                ]);
                onFinished();
            },
            onError: (error) => toast.error(getErrorMessage(error, "Не удалось завершить"))
        }
    });

    return (
        <Button
            variant="outline"
            disabled={finish.isPending}
            onClick={() => finish.mutate({ id: interviewId })}
        >
            {finish.isPending ? <Spinner /> : <FlagIcon />}
            {finish.isPending ? "Оцениваем…" : "Завершить"}
        </Button>
    );
};
