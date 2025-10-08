import type { Card } from './game';

export type TooltipConfig = {
    label?: string;
    delay?: number;
    onClick?: () => void;
    secondaryLabel?: string;
    onSecondaryClick?: () => void;
    waitingDots?: boolean;
    card?: Card;
    noQueue?: boolean;
};

export type PopupConfig = {
    children: React.ReactNode;
    onClick: () => void;
    bottomText?: string;
};

export type HostOptions = {
    playerName: string;
    port: number;
};

export type JoinOptions = {
    playerName: string;
    ip: string;
};

export type ClientOptions = {
    server: string;
    playerID: string;
    credentials: string;
    matchID: string;
};
