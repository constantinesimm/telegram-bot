import { SetMetadata } from "@nestjs/common";

export const TELEGRAM_CALLBACK_METADATA = "TELEGRAM_CALLBACK_METADATA";

export interface TelegramCallbackOptions {
    pattern: string | RegExp;
}

export const TelegramCallback = (options: TelegramCallbackOptions) =>
    SetMetadata(TELEGRAM_CALLBACK_METADATA, options);