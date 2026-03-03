import { UUID } from "node:crypto";

import { Context, SessionFlavor } from "grammy";

import { SceneName } from "#src/infra/telegram-bot/shared/types/scene.type";

export type MyContext = Context & SessionFlavor<SessionData>;

export interface SessionData {
  instructionsLessonId?: UUID;
  isRestricted?: boolean;
  lmsUserId?: UUID;
  scene?: SceneName;
  supportItemId?: string;
}
