import "highlight.js/styles/github-dark.min.css";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { cn } from "@/shared/lib/utils";

interface MarkdownProps {
    children: string;
    className?: string;
}

/** Рендер markdown-ответов LLM: списки, таблицы, код с подсветкой */
export const Markdown = ({ children, className }: MarkdownProps) => (
    <div
        className={cn(
            "space-y-3 text-sm leading-relaxed break-words",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_a]:underline [&_a]:underline-offset-4",
            "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em]",
            "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:text-xs [&_pre_code]:rounded-lg",
            "[&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1",
            className
        )}
    >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {children}
        </ReactMarkdown>
    </div>
);
