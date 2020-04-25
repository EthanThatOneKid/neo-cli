const classifyMessageMap = (token, messageMap) => {
  return Object.entries(messageMap)
    .reduce((result, [key, make]) => {
      result[key] = (...args) => ({ token, message: make(...args)});
      return result;
    }, {});
};

export {
  classifyMessageMap
};