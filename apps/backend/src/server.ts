import { createApp } from "./app.js";
import config from "./config/environment.js";

const app = createApp();

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
});
