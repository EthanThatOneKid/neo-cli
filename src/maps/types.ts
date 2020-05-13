interface Type {
  token: string,
  selfDeclarable: boolean,
  empty: any,
  make: (x: any) => any,
  toString: (x: any) => string
}

interface Types {
  [typeKey: string]: Type
}

const types = {
  INTEGER: {
    token: "int",
    selfDeclarable: true,
    empty: 0,
    make: n => Math.floor(Number(n)),
    toString: String
  },
  TEXT: {
    token: "text",
    selfDeclarable: true,
    empty: "",
    make: String,
    toString: String
  },
  BOOLEAN: {
    token: "boo",
    selfDeclarable: true,
    empty: true,
    make: v => v === "true" || Boolean(Number(v)),
    toString: b => b ? "true" : "false"
  },
  URL: {
    token: "url",
    selfDeclarable: true,
    empty: "",
    make: String,
    toString: String
  },
  SELECTOR: {
    token: "sel",
    selfDeclarable: true,
    empty: "",
    make: String,
    toString: String
  },
  LIST: {
    token: "list",
    selfDeclarable: false,
    empty: { type: this.TEXT, items: [] },
    make: o => ({ ...o }),
    toString: ({ items }) => JSON.stringify(items)
  },
  COOKIE: {
    token: "cook",
    selfDeclarable: false,
    empty: {},
    make: o => ({ ...o }),
    toString: JSON.stringify
  },
  INSTRUCTION: {
    token: "instrn",
    selfDeclarable: false,
    empty: {},
    make: o => ({ ...o }),
    toString: JSON.stringify
  },
  REST: {
    token: "dsfsdfsdfdfsdfsfsdsf",
    selfDeclarable: false,
    empty: {},
    make: () => ({}),
    toString: () => "..."
  }
};

export { types, Type, Types };