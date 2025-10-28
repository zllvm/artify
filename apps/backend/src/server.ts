import { createApp } from "./app.js";
import config from "./config/environment.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running at ${config.baseUrl}:${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Public Key: ${config.jwtPublicKey}`);
});
