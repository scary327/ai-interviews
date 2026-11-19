import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import {
    getExtractResumeTextMutationKey,
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
import { Textarea } from "@/shared/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { LEVEL_LABELS, POSITION_PRESETS, VACANCY_MAX_LENGTH } from "../constants";
import { interviewSetupSchema, type InterviewSetupValues, parseTopics } from "../model/schemas";
import { ResumeField } from "./ResumeField";

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
            resumeText: "",
            vacancyText: "",
            ...defaultValues
        }
    });
    const { errors } = form.formState;

    // Иначе собеседование создастся без резюме
    const extractingResume = useIsMutating({ mutationKey: getExtractResumeTextMutationKey() }) > 0;

    const onSubmit = form.handleSubmit(({ topics, ...values }) =>
        create.mutate({ data: { ...values, topics: parseTopics(topics) } })
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

                <Controller
                    control={form.control}
                    name="vacancyText"
                    render={({ field }) => (
                        <Field data-invalid={!!errors.vacancyText}>
                            <FieldLabel htmlFor="vacancyText">Вакансия</FieldLabel>
                            <Textarea
                                id="vacancyText"
                                placeholder="Вставьте текст вакансии"
                                className="max-h-64"
                                rows={3}
                                aria-invalid={!!errors.vacancyText}
                                {...field}
                            />
                            <FieldDescription>
                                Необязательно. Интервьюер учтёт требования вакансии.{" "}
                                {field.value.length.toLocaleString("ru-RU")} /{" "}
                                {VACANCY_MAX_LENGTH.toLocaleString("ru-RU")}
                            </FieldDescription>
                            <FieldError errors={[errors.vacancyText]} />
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="resumeText"
                    render={({ field }) => (
                        <ResumeField
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.resumeText}
                        />
                    )}
                />

                <Button type="submit" disabled={create.isPending || extractingResume}>
                    {create.isPending && <Spinner />}
                    Начать собеседование
                </Button>
            </FieldGroup>
        </form>
    );
};
