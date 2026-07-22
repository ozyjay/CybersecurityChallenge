import net from "node:net";

export function validateDevelopmentPort(value) {
  const port = Number(value ?? "4173");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("APP_PORT must be a whole number between 1024 and 65535.");
  }
  if (port === 3600 || port === 8600 || (port >= 8610 && port <= 8699)) {
    throw new Error(`APP_PORT ${port} is reserved for ModelDeck.`);
  }
  return port;
}

export function portConflictMessage(host, port, error) {
  const reason = error?.code === "EADDRINUSE" ? "the port is already occupied" : error?.message ?? "the port could not be checked";
  return `Cannot start the demo on ${host}:${port}: ${reason}.`;
}

export function assertPortAvailable(host, port, createServer = net.createServer) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) => reject(new Error(portConflictMessage(host, port, error))));
    probe.once("listening", () => probe.close(resolve));
    probe.listen(port, host);
  });
}
