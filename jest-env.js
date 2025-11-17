const NodeEnvironment = require('jest-environment-node').TestEnvironment;

class CustomNodeEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    // Set up localStorage mock BEFORE calling super.setup()
    if (!this.global) {
      this.global = {};
    }
    this.global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };

    await super.setup();
  }
}

module.exports = CustomNodeEnvironment;
