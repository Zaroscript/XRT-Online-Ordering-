// No-operation logger - completely disables logging
const noopLogger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {}
};

export default noopLogger;
