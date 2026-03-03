import { ICommand } from "@nestjs/cqrs";
import { MyContext } from "#src/infra/telegram-bot/shared/types/telegram-context.type";

export class EnterFaqCommand implements ICommand {
    public constructor(public readonly ctx: MyContext) {}
}