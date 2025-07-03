(function () {
  const path = require("path");
  const fs = require("fs");

  class CustomReporter {
    constructor(globalConfig, reporterOptions, reporterContext) {
      this._globalConfig = globalConfig;
      this._options = reporterOptions;
      this._context = reporterContext;
    }

    onRunComplete(testContexts, results) {
      let output = {};

      output.variant = this._options.outputFileName;
      output.numPassedTests = results.numPassedTests;
      output.numFailedTests = results.numFailedTests;
      output.numTotalTests = results.numTotalTests;

      const outputPath = path.resolve(
        __dirname,
        "..",
        "reports",
        "coverage",
        `${this._options.outputFileName}.json`
      );
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
    }
  }

  module.exports = CustomReporter;
})();
