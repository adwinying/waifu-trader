/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "build",
  devServerPort: process.env.DEV_PORT || 8002,
  ignoredRouteFiles: [".*"],
  routes(defineRoutes) {
    return defineRoutes((route) => {
      if (process.env.NODE_ENV === "production") return;
      if (process.env.TEST_ROUTES_ENABLED !== "true") return;

      const files = fs.readdirSync(path.join(__dirname, "app/routes/_test"));

      files.forEach((fileName) => {
        const routePath = fileName.replace(".tsx", "");

        route(`_test/${routePath}`, `routes/_test/${fileName}`);
      });
    });
  },
};
