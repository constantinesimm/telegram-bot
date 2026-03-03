import { Injectable, Logger } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { Bot } from "grammy";

import { TELEGRAM_CALLBACK_METADATA, TelegramCallbackOptions } from "../decorators/telegram-callback.decorator";
import { MyContext } from "../types/telegram-context.type";

@Injectable()
export class TelegramBotCallbackRegistry {
    private readonly _logger = new Logger(TelegramBotCallbackRegistry.name);

    public constructor(private readonly _discoveryService: DiscoveryService) {}

    public register(bot: Bot<MyContext>): void {
        const providers = this._discoveryService.getProviders();

        for (const wrapper of providers) {
            const { instance } = wrapper;
            if (!instance || typeof instance !== "object") continue;

            const options: TelegramCallbackOptions = Reflect.getMetadata(
                TELEGRAM_CALLBACK_METADATA,
                instance.constructor,
            );

            if (options && typeof instance.handle === "function") {
                bot.callbackQuery(options.pattern, async (ctx: MyContext) => {
                    try {
                        await instance.handle(ctx);
                    } catch (error) {
                        this._logger.error(`Error in callback ${options.pattern}:`, error);
                    }
                });
                this._logger.debug(`Registered callback for pattern: ${options.pattern}`);
            }
        }
    }
}