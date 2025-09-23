import type { Card } from './game';

export type TooltipConfig = {
    label?: string;
    delay?: number;
    duration?: number;
    onClick?: () => void;
    secondaryLabel?: string;
    onSecondaryClick?: () => void;
    waitingDots?: boolean;
    card?: Card;
};

export type PopupConfig = {
    children: React.ReactNode;
    onClick: () => void;
    bottomText?: string;
};
