import { expect, type Page } from "@playwright/test";

export function guardLocalRuntime(page: Page) {
  const problems: string[] = [];
  const externalRequests: string[] = [];

  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console error: ${message.text()}`);
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.hostname !== "127.0.0.1") externalRequests.push(request.url());
  });

  return {
    assertClean() {
      expect(externalRequests, "external runtime requests").toEqual([]);
      expect(problems, "uncaught page or console errors").toEqual([]);
    }
  };
}
