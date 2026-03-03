import { Injectable, Logger } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { Bot } from "grammy";
import { BotCommand } from "grammy/types";

import {
    TELEGRAM_COMMAND_METADATA,
    TelegramCommandOptions,
} from "../decorators/telegram-command.decorator";
import { MyContext } from "../types/telegram-context.type";

@Injectable()
export class TelegramBotCommandRegistry {
    private readonly _logger = new Logger(TelegramBotCommandRegistry.name);

    public constructor(private readonly _discoveryService: DiscoveryService) {}

    public async register(bot: Bot<MyContext>): Promise<void> {
        const discoveredCommands = this._discoverCommands();

        const menuCommands: BotCommand[] = discoveredCommands.map(({ options }) => ({
            command: options.command,
            description: options.description,
        }));

        if (menuCommands.length > 0) {
            try {
                await bot.api.setMyCommands(menuCommands);
                this._logger.debug(`Successful installed ${menuCommands.length} commands in bot menu.`);
            } catch (error) {
                this._logger.error("Commands install error", error);
            }
        }

        for (const { options, handler } of discoveredCommands) {
            bot.command(options.command, async (ctx: MyContext) => {
                try {
                    await handler.handle(ctx);
                } catch (error) {
                    this._logger.error(`Command execute error /${options.command}:`, error);
                }
            });

            this._logger.debug(`Register command handler: /${options.command}`);
        }
    }

    private _discoverCommands(): { options: TelegramCommandOptions; handler: any }[] {
        const providers = this._discoveryService.getProviders();
        const discovered: { options: TelegramCommandOptions; handler: any }[] = [];

        for (const wrapper of providers) {
            const { instance } = wrapper;

            if (!instance || typeof instance !== "object") {
                continue;
            }

            const options: TelegramCommandOptions = Reflect.getMetadata(
                TELEGRAM_COMMAND_METADATA,
                instance.constructor,
            );

            if (options && typeof instance.handle === "function") {
                discovered.push({ options, handler: instance });
            }
        }

        return discovered;
    }
}