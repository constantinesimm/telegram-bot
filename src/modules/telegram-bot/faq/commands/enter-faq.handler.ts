import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { EnterFaqCommand } from "./enter-faq.command";
import { SCENES } from "#src/infra/telegram-bot/shared/constants/scenes.constants";
import { SceneViewRendererService } from "#src/infra/telegram-bot/shared/services/scene-view-renderer.service";
import { GetFaqSceneViewQuery } from "../../queries/get-faq-scene-view/get-faq-scene-view.query";
import { SceneViewDto } from "#src/modules/telegram-bot/shared/types/scene-view.dto";

@CommandHandler(EnterFaqCommand)
export class EnterFaqHandler implements ICommandHandler<EnterFaqCommand> {
    public constructor(
        private readonly _queryBus: QueryBus,
        private readonly _sceneViewRenderer: SceneViewRendererService,
    ) {}

    public async execute(command: EnterFaqCommand): Promise<void> {
        const { ctx } = command;

        ctx.session.scene = SCENES.FAQ;

        if (ctx.callbackQuery) {
            await ctx.answerCallbackQuery().catch(() => {});
        }

        const view = await this._queryBus.execute<GetFaqSceneViewQuery, SceneViewDto>(
            new GetFaqSceneViewQuery()
        );

        await this._sceneViewRenderer.render(ctx, view);
    }
}