import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import {
    getListInterviewsQueryKey,
    type Interview,
    InterviewLevel,
    useCreateInterview
} from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errors";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { LEVEL_LABELS, POSITION_PRESETS } from "../constants";
import { interviewSetupSchema, type InterviewSetupValues, parseTopics } from "../model/schemas";

interface InterviewSetupFormProps {
    defaultValues?: Partial<InterviewSetupValues>;
    onCreated: (interview: Interview) => void;
}

export const InterviewSetupForm = ({ defaultValues, onCreated }: InterviewSetupFormProps) => {
    const queryClient = useQueryClient();
    const create = useCreateInterview({
        mutation: {
            onSuccess: (interview) => {
                void queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey() });
                onCreated(interview);
            }
        }
    });

    const form = useForm<InterviewSetupValues>({
        resolver: zodResolver(interviewSetupSchema),
        defaultValues: {
            position: POSITION_PRESETS[0],
            level: "junior",
            topics: "",
            ...defaultValues
        }
    });
    const { errors } = form.formState;

    const onSubmit = form.handleSubmit(({ position, level, topics }) =>
        create.mutate({ data: { position, level, topics: parseTopics(topics) } })
    );

    return (
        <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
                {create.isError && (
                    <Alert variant="destructive">
                        <AlertDescription>{getErrorMessage(create.error)}</AlertDescription>
                    </Alert>
                )}

                <Controller
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                        <Field data-invalid={!!errors.position}>
                            <FieldLabel htmlFor="position">Позиция</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="position" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {POSITION_PRESETS.map((p) => (
                                        <SelectItem key={p} value={p}>
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError errors={[errors.position]} />
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Уровень</FieldLabel>
                            <ToggleGroup
                                type="single"
                                variant="outline"
                                value={field.value}
                                onValueChange={(v) => v && field.onChange(v)}
                                className="w-full"
                            >
                                {Object.values(InterviewLevel).map((level) => (
                                    <ToggleGroupItem key={level} value={level} className="flex-1">
                                        {LEVEL_LABELS[level]}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </Field>
                    )}
                />

                <Field>
                    <FieldLabel htmlFor="topics">Темы</FieldLabel>
                    <Input
                        id="topics"
                        placeholder="Spring, SQL, многопоточность"
                        {...form.register("topics")}
                    />
                    <FieldDescription>
                        Через запятую. Можно оставить пустым — интервьюер выберет сам
                    </FieldDescription>
                </Field>

                <Button type="submit" disabled={create.isPending}>
                    {create.isPending && <Spinner />}
                    Начать собеседование
                </Button>
            </FieldGroup>
        </form>
    );
};
