const Variable = ({ value, type }) => ({
  value, type,
  make(scope = {}) {
    let populatedValue = this.value;
    if (typeof this.value === "string") {
      populatedValue = Object.keys(scope)
        .reduce((result, varName) => {
          if (result.indexOf(varName) > -1) {
            const varValue = scope[varName].make(scope);
            return result.replace(varName, varValue);
          }
          return result;
        }, this.value);
    } else {
      // console.log("HEHEHEHEH", this.type, populatedValue)
    }
    return this.type.make(populatedValue);
  }
 });

module.exports = { Variable };