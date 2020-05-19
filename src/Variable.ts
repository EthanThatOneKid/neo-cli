import { types, Type } from './maps/types';

const checkIsStringBasedType = ({ token }): boolean => {
  const nonStringBasedTypeTokens = [
    types.LIST, types.COOKIE, types.INTEGER, types.BOOLEAN
  ].map(({ token }) => token);
  return !nonStringBasedTypeTokens.some(t => t === token);
};

interface Scope {
  [k: string]: VariableType
}

interface VariableArgument {
  value: any,
  type: Type
}

interface VariableType {
  value: any,
  type: Type,
  make: (scope?: Scope) => any,
  arguments?: { name: string, type: Type }[] // `play` keyword
}

const Variable = ({ value, type }: VariableArgument): VariableType => ({
  value, type,
  make(scope = {}) {
    let populatedValue;
    if (checkIsStringBasedType(this.type)) {
      populatedValue = Object.keys(scope)
        .reduce((result, varName) => {
          if (result.indexOf(varName) > -1) {
            const gimmeVar = scope[varName];
            const varStringValue = gimmeVar.type.toString(gimmeVar.make(scope));
            return result.replace(varName, varStringValue);
          }
          return result;
        }, this.type.toString(this.value));
    } else {
      populatedValue = scope.hasOwnProperty(this.value)
        ? scope[this.value].value
        : this.type.make(this.value);
    }
    return this.type.make(populatedValue);
  }
});

export default Variable;

export {
  Scope,
  VariableArgument,
  VariableType
};