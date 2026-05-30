import type { ConversationResponse } from "./ConversationType";
import type { ConversationMemberResponse } from "./ConversationMemberType";
import type { MessageResponse } from "./MessageType";

export interface EnrichedConversation extends ConversationResponse {
  members: ConversationMemberResponse[];
  lastMessage?: MessageResponse;
  displayName: string;
  displayAvatar: string;
}
