import { defineConfig, loadEnv } from "vite";
import * as fs from "fs";
import dotenv from "dotenv";

export default ({ command, mode }) => {
  if (mode === "production") {
    console.log("for gh-pages...");

    const config = defineConfig({
      base: "/babylon-webar-sandbox",
    });

    return config;
  } else {
    console.log("for local...");

    const envConf = dotenv.config({
      path: "./.env.local",
    });

    const config = defineConfig({
      define: {
        "process.env": { ...envConf.parsed },
      },
      server: {
        https: {
          key: fs.readFileSync("./key.pem"),
          cert: fs.readFileSync("./cert.pem"),
        },
      },
    });

    return config;
  }
};
