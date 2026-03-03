import { SetMetadata } from "@nestjs/common";

export const TELEGRAM_COMMAND_METADATA = "TELEGRAM_COMMAND_METADATA";

export interface TelegramCommandOptions {
    command: string;
    description: string;
}

export const TelegramCommand = (options: TelegramCommandOptions) =>
    SetMetadata(TELEGRAM_COMMAND_METADATA, options);