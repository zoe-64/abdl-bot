import { api } from ".";
import { botData } from "./data";

const BCT_VERSION = "B.0.6.9";
const moneyInTransaction: Transaction[] = [];
type Transaction = {
  MemberNumber: number;
  Amount: number;
};
type BCT_Dictionary = {
  Type: "Hidden";
  Sender: number;
  Dictionary: { message: BCT_DictionaryMessage_MoneySend | BCT_DictionaryMessage_MoneyTaken }[];
  Content: "bctMsg";
};

export type BCT_DictionaryMessage_MoneySend = {
  type: "moneysend";
  bctVersion: string;
  bctMoneySentAmount: number;
  target: number;
};

export type BCT_DictionaryMessage_MoneyTaken = {
  type: "moneytaken";
  bctMoneyTaken: boolean;
  bctAmount: number;
  target: number;
};

export function IsBCTMessage(message: unknown): message is BCT_Dictionary {
  if (typeof message !== "object" || message === null) return false;
  return "Content" in message && message.Content === "bctMsg";
}
export function MessageIsMoneyTaken(message: object): message is { message: BCT_DictionaryMessage_MoneyTaken } {
  if (typeof message !== "object" || message === null) return false;
  if ("message" in message) {
    const innerMessage = message.message;
    if (typeof innerMessage !== "object" || innerMessage === null) return false;
    return "type" in innerMessage && innerMessage.type === "moneytaken";
  }
  return false;
}
function HasInnerMessage(message: object): message is { message: object } {
  if ("message" in message) {
    return true;
  }
  return false;
}
export function MessageIsMoneySend(message: object): message is { message: BCT_DictionaryMessage_MoneySend } {
  if (!HasInnerMessage(message)) return false;

  const innerMessage = message.message;
  if (typeof innerMessage !== "object" || innerMessage === null) return false;
  return "type" in innerMessage && innerMessage.type === "moneysend";
}

export function SendMoneyToMember(targetNumber: number, amount: number) {
  const currTransactionAmount =
    moneyInTransaction.reduce((previousValue, curr) => previousValue + curr.Amount, 0) + amount;
  if (botData.money - currTransactionAmount < 0) {
    return;
  }

  botData.money -= amount;
  if (botData.money < 0) botData.money = 0;

  moneyInTransaction.push({
    MemberNumber: targetNumber,
    Amount: amount,
  });

  api.SendMessage("Hidden", "bctMsg", targetNumber, [
    {
      message: {
        type: "moneysend",
        bctVersion: BCT_VERSION,
        bctMoneySentAmount: amount,
        target: targetNumber,
      },
    },
  ]);
}

export function SendMoneyAccept(SenderNumber: number, Amount: number, Accept: boolean) {
  if (!api.chatRoom?.characters.some((character) => character.MemberNumber === SenderNumber)) {
    return;
  }

  if (Accept) {
    botData.money += Amount;
  }

  api.SendMessage("Hidden", "bctMsg", SenderNumber, [
    {
      message: {
        type: "moneytaken",
        bctMoneyTaken: Accept,
        bctAmount: Amount,
        target: SenderNumber,
      },
    },
  ]);
}
