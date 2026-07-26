const path = require("path");

function clearServerModuleCache() {
  const serverRoot = path.resolve(__dirname, "../..");
  // vi.mock(serverRoot);
  for (const cachedPath of Object.keys(require.cache)) {
    if (cachedPath.startsWith(serverRoot)) {
      delete require.cache[cachedPath];
    }
  }
}

module.exports = clearServerModuleCache;