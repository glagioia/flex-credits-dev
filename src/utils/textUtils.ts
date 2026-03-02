
import * as texts from "../data/english.json";
const dataText: Record<string, string> = texts as unknown as Record<string, string>;

export const getText = (key: string, defaultText?: string): string => {
    if (dataText[key])
        return dataText[key]
    return defaultText ?? ''
}