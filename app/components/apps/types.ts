import { type ReactNode } from "react";

export type AppDefinition = {
    id: string;
    title: string;
    icon: ReactNode;
    accentColor: string;
    width ?: number;
    height ?: number;
    minWidth ?: number;
    minHeight ?: number;
    content: ReactNode;
}
