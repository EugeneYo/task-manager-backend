const tsConfig = require("./tsconfig.json");
const tsConfigPaths = require("tsconfig-paths");

// Registering the paths used for transpiled Javascript project (./build)
// This is required to run ./build/index.js
tsConfigPaths.register({
	baseUrl: tsConfig.compilerOptions.outDir, // ./build
	paths: tsConfig.compilerOptions.paths, // @config, @database, @controller, etc..
});
