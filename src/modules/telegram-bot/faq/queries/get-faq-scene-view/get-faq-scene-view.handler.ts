import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { GetFaqSceneViewQuery } from "./get-faq-scene-view.query";

import { TelegramFaqConfig } from "#src/modules/telegram-bot/faq/shared/entities/telegram-faq-config.entity";
import { TelegramFaqItem } from "#src/modules/telegram-bot/faq/shared/entities/telegram-faq-item.entity";
import { TelegramFaqConfigRepository } from "#src/modules/telegram-bot/faq/shared/repositories/telegram-faq-config.repository";
import { BACK_BUTTON_TEXT, MAIN_MENU_BUTTON_TEXT } from "#src/modules/telegram-bot/shared/constants/back-button.constants";
import { CALLBACKS } from "#src/modules/telegram-bot/shared/constants/callbacks.constants";
import { FAQ_VIEW } from "#src/modules/telegram-bot/shared/constants/faq-view.constants";
import { type SceneViewDto, SceneViewType } from "#src/modules/telegram-bot/shared/types/scene-view.dto";

@QueryHandler(GetFaqSceneViewQuery)
export class GetFaqSceneViewHandler implements IQueryHandler<GetFaqSceneViewQuery, SceneViewDto> {
  public constructor(private readonly _faqConfigRepository: TelegramFaqConfigRepository) {}

  public async execute(): Promise<SceneViewDto> {
    try {
      const config: TelegramFaqConfig = await this._faqConfigRepository.getActiveOrFail();
      const items: TelegramFaqItem[] = config.items ?? [];
      const messageText: string = this._buildMessage(config, items);
      const buttons = [[{ callback_data: CALLBACKS.BACK, text: BACK_BUTTON_TEXT }]];
      return {
        buttons,
        linkPreviewDisabled: true,
        messageText,
        parseMode: "HTML",
        photoUrl: config.bannerUrl,
        type: SceneViewType.CONTENT,
      };
    } catch {
      return {
        buttons: [[{ callback_data: CALLBACKS.BACK, text: MAIN_MENU_BUTTON_TEXT }]],
        type: SceneViewType.UNAVAILABLE,
      };
    }
  }

  private _buildMessage(config: TelegramFaqConfig, items: TelegramFaqItem[]): string {
    const { disclaimerText, introText, notionTitle, notionUrl } = config;
    const intro: string[] = introText ? [introText, ""] : [];
    const faqItems: string[] = items.map((item: TelegramFaqItem, index: number) => {
      const num: string = `${index + 1}.`;
      const watch: string = item.url
        ? `<a href="${item.url}">${FAQ_VIEW.WATCH_VIDEO_LABEL}</a>`
        : FAQ_VIEW.WATCH_VIDEO_LABEL;
      const title: string = item.title ?? "";
      return `${num} ${title}\n${watch}`;
    });
    const notion: string[] = [];
    if (notionTitle || notionUrl) {
      notion.push("");
      notion.push(FAQ_VIEW.MORE_INFO_PREFIX);
      notion.push(notionUrl ? `<a href="${notionUrl}">${notionTitle || notionUrl}</a>` : notionTitle || "");
    }
    if (disclaimerText) {
      notion.push("");
      notion.push(disclaimerText);
    }
    return [...intro, ...faqItems, ...notion].join("\n");
  }
}
