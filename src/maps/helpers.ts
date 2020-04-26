interface MessageMap {
  [s: string]: (...s: string[]) => string;
}

interface ClassifiedMessage {
  token: string,
  message: string
}

interface ClassifiedMessageMap {
  [s: string]: (...s: string[]) => ClassifiedMessage
}

const classifyMessageMap = (
  token: string,
  messageMap: MessageMap
): ClassifiedMessageMap => {
  return Object.entries(messageMap)
    .reduce((result: ClassifiedMessageMap, [key, make]) => {
      result[key] = (...args) => ({ token, message: make(...args)});
      return result;
    }, {} as ClassifiedMessageMap);
};

export {
  ClassifiedMessage,
  ClassifiedMessageMap,
  classifyMessageMap
};