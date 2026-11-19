import { isAxiosError } from "axios";
import { UploadIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { useExtractResumeText } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/ui/field";
import { Spinner } from "@/shared/ui/spinner";
import { Textarea } from "@/shared/ui/textarea";

import { RESUME_FILE_MAX_BYTES, RESUME_MAX_LENGTH } from "../constants";

const FILE_TOO_LARGE = "Файл больше 5 МБ";

const EXTRACT_ERRORS: Record<number, string> = {
    401: "Сессия истекла — войдите снова",
    413: FILE_TOO_LARGE,
    415: "Поддерживаются только PDF, DOCX и TXT",
    422: "Не удалось достать текст: файл пустой, защищён паролем, это скан или текст слишком длинный. Вставьте текст вручную"
};

const extractErrorMessage = (error: unknown) => {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status && EXTRACT_ERRORS[status]) return EXTRACT_ERRORS[status];
    return isAxiosError(error) && !error.response
        ? "Нет соединения с сервером"
        : "Не удалось загрузить файл — попробуйте ещё раз";
};

interface ResumeFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: { message?: string };
}

export const ResumeField = ({ value, onChange, error }: ResumeFieldProps) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const extract = useExtractResumeText({
        mutation: {
            onSuccess: ({ text }) => {
                onChange(text);
                if (text.length > RESUME_MAX_LENGTH) {
                    setFileError(
                        `Текст из файла длиннее ${RESUME_MAX_LENGTH.toLocaleString("ru-RU")} символов — сократите его`
                    );
                }
            },
            onError: (e) => setFileError(extractErrorMessage(e))
        }
    });

    const onFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Иначе тот же файл нельзя выбрать повторно
        e.target.value = "";
        if (!file) return;
        if (file.size > RESUME_FILE_MAX_BYTES) {
            setFileError(FILE_TOO_LARGE);
            return;
        }
        setFileError(null);
        extract.mutate({ data: { file } });
    };

    return (
        <Field data-invalid={!!error}>
            <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="resumeText">Резюме</FieldLabel>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={extract.isPending}
                    onClick={() => fileInput.current?.click()}
                >
                    {extract.isPending ? <Spinner /> : <UploadIcon />}
                    Загрузить файл
                </Button>
                <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={onFile}
                />
            </div>
            <Textarea
                id="resumeText"
                value={value}
                onChange={(e) => {
                    setFileError(null);
                    onChange(e.target.value);
                }}
                readOnly={extract.isPending}
                placeholder="Вставьте текст резюме или загрузите файл"
                className="max-h-64"
                rows={4}
                aria-invalid={!!error}
            />
            <FieldDescription>
                Необязательно. PDF, DOCX или TXT до 5 МБ, файл заменит текст в поле. Почту,
                телефоны, ссылки и дату рождения убираем автоматически — проверьте текст, его увидит
                интервьюер. {value.length.toLocaleString("ru-RU")} /{" "}
                {RESUME_MAX_LENGTH.toLocaleString("ru-RU")}
            </FieldDescription>
            <FieldError errors={fileError ? [{ message: fileError }] : [error]} />
        </Field>
    );
};
