import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { TelegramCallback } from "#src/infra/telegram-bot/shared/decorators/telegram-callback.decorator";
import { TelegramCommand } from "#src/infra/telegram-bot/shared/decorators/telegram-command.decorator";
import { COMMANDS, COMMAND_DESCRIPTIONS } from "#src/infra/telegram-bot/shared/constants/commands.constants";
import { CALLBACKS } from "#src/infra/telegram-bot/shared/constants/callbacks.constants";
import { MyContext } from "#src/infra/telegram-bot/shared/types/telegram-context.type";
import { EnterFaqCommand } from "../commands/enter-faq/enter-faq.command";

@Injectable()
@TelegramCommand({ command: COMMANDS.FAQ, description: COMMAND_DESCRIPTIONS.FAQ })
@TelegramCallback({ pattern: CALLBACKS.ENTER_SCENE_FAQ })
export class FaqController {
    public constructor(private readonly _commandBus: CommandBus) {}

    public async handle(ctx: MyContext): Promise<void> {
        await this._commandBus.execute(new EnterFaqCommand(ctx));
    }
}