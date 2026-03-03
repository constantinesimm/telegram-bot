import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { BlockedUserMiddleware } from "./middlewares/blocked-user.middleware";
import { SceneMiddleware } from "./middlewares/scene.middleware";
import { TelegramBotCallbackRegistry } from "./registries/telegram-bot-callback-registry.service";
import { TelegramBotChatMemberRegistry } from "./registries/telegram-bot-chat-member-registry.service";
import { TelegramBotCommandRegistry } from "./registries/telegram-bot-command-registry.service";
import { KeyboardService } from "./services/keyboard.service";
import { SceneViewRendererService } from "./services/scene-view-renderer.service";
import { TelegramBotService } from "./services/telegram-bot.service";

@Module({
    imports: [DiscoveryModule],
    providers: [
        TelegramBotService,
        KeyboardService,
        SceneViewRendererService,
        TelegramBotCommandRegistry,
        TelegramBotCallbackRegistry,
        TelegramBotChatMemberRegistry,
        SceneMiddleware,
        BlockedUserMiddleware,
    ],
    exports: [SceneViewRendererService],
})
export class TelegramBotInfraModule {}