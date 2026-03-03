@Injectable()
export class TelegramBotService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy {
    private _bot: Bot<MyContext> | null = null;
    private readonly _logger = new Logger(TelegramBotService.name);
    private _runner: RunnerHandle | null = null;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _sceneMiddleware: SceneMiddleware,
        private readonly _blockedUserMiddleware: BlockedUserMiddleware,
        private readonly _commandRegistry: TelegramBotCommandRegistry,
        private readonly _callbackRegistry: TelegramBotCallbackRegistry,
        private readonly _chatMemberRegistry: TelegramBotChatMemberRegistry,
    ) {}

    async onModuleInit() {
        const config = this._configService.get<TelegramConfigDto>(TELEGRAM_CONFIG_KEY);
        if (!config?.botToken) {
            this._logger.error("TELEGRAM_BOT_TOKEN is missing! Bot cannot start.");
            return;
        }

        this._bot = new Bot<MyContext>(config.botToken);
        this._setupPipeline();
        await this._registerHandlers();
    }

    private _setupPipeline() {
        if (!this._bot) return;

        this._bot.api.config.use(autoRetry());

        this._bot.catch((err) => {
            this._logger.error(`Grammy error [${err.name}]: ${err.message}`, err.stack);
        });

        this._bot.use((ctx, next) => this._blockedUserMiddleware.handle(ctx, next));

        this._bot.use(session({ initial: () => ({}) }));

        this._bot.use(limit({
            keyGenerator: (ctx) => ctx.from?.id?.toString() ?? ctx.chat?.id?.toString() ?? RATE_LIMIT.DEFAULT_KEY,
            limit: RATE_LIMIT.LIMIT,
            timeFrame: RATE_LIMIT.TIME_FRAME_MS,
            onLimitExceeded: (ctx) => {
                if (ctx.callbackQuery) void ctx.answerCallbackQuery({ text: RATE_LIMIT.MESSAGE });
            },
        }));

        this._bot.use((ctx, next) => this._sceneMiddleware.handle(ctx, next));
    }

    private async _registerHandlers() {
        if (!this._bot) return;

        await Promise.all([
            this._commandRegistry.register(this._bot),
            this._callbackRegistry.register(this._bot),
            this._chatMemberRegistry.register(this._bot),
        ]);
    }

    onApplicationBootstrap() {
        if (!this._bot) return;

        this._logger.log("Starting Telegram Bot Runner...");
        this._runner = run(this._bot, {
            runner: {
                fetch: { allowed_updates: ["message", "callback_query", "chat_member"] },
            },
        });
    }

    async onModuleDestroy() {
        this._logger.log("Shutting down Telegram Bot...");
        await this._runner?.stop();
    }
}