const tsConfig = require("../tsconfig.json")
const tsConfigPaths = require("tsconfig-paths")
 
tsConfigPaths.register({
  baseUrl: '.nest',
  paths: tsConfig.compilerOptions.paths,
})
