const path = require("path");

function mockModule(modulePath, exportsValue) {
  const resolvedPath = require.resolve(
    path.join(__dirname, "..", modulePath)
  );

  require.cache[resolvedPath] = {
    id: resolvedPath,
    filename: resolvedPath,
    loaded: true,
    exports: exportsValue,
  };
}

module.exports = mockModule;