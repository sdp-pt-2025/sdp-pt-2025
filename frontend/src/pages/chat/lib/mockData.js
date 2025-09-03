import { generateChatId } from "./utils";

export const chats = [
  {
    id: generateChatId(),
    name: "Alice",
    messages: [
      { sender: "Alice", text: "Hello!" },
      { sender: "me", text: "Hey, how are you?" },
    ],
  },
  {
    id: generateChatId(),
    name: "Bob",
    messages: [
      { sender: "Bob", text: "Meeting at 3?" },
      { sender: "me", text: "Sure, see you!" },
    ],
  },
];
