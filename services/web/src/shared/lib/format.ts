const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
});

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

/** «3 собеседования», «1 собеседование», «5 собеседований» */
export const pluralize = (count: number, [one, few, many]: [string, string, string]) => {
    const rule = new Intl.PluralRules("ru-RU").select(count);
    const word = rule === "one" ? one : rule === "few" ? few : many;
    return `${count} ${word}`;
};
