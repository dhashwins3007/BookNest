import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";

test(
  "API integration: authentication, CRUD, loans, holds and validation",
  async () => {
    const dir = await mkdtemp(join(tmpdir(), "booknest-test-"));
    const database = join(dir, "db.json");
    await copyFile(new URL("../db.json", import.meta.url), database);
    const child = spawn(process.execPath, ["server.mjs"], {
      cwd: new URL("../", import.meta.url),
      env: { ...process.env, PORT: "0", BOOKNEST_DB: database },
      stdio: ["ignore", "pipe", "pipe"],
    });
    try {
      const address = await new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code) =>
          reject(new Error(`Server exited: ${code}`)),
        );
        let text = "";
        child.stdout.on("data", (chunk) => {
          text += chunk;
          const match = text.match(/127\.0\.0\.1:(\d+)/);
          if (match) resolve("http://127.0.0.1:" + match[1] + "/api");
        });
      });
      async function req(method, path, data, token, status = 200) {
        const response = await fetch(address + path, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: data === undefined ? undefined : JSON.stringify(data),
        });
        const result = await response.json();
        assert.equal(response.status, status, JSON.stringify(result));
        return result;
      }
      await req("GET", "/books", undefined, undefined, 401);
      await req(
        "POST",
        "/auth/login",
        { username: "LIB101", password: "wrong" },
        undefined,
        401,
      );
      const a = await req("POST", "/auth/login", {
        username: "LIB101",
        password: "Library@123",
      });
      const token = a.accessToken;
      assert.equal(a.member.id, "LIB101");
      assert.equal((await req("GET", "/books", undefined, token)).length, 6);
      await req(
        "POST",
        "/auth/signup",
        { name: 7, email: "x" },
        undefined,
        400,
      );
      await req(
        "POST",
        "/auth/signup",
        {
          name: "Reader Two",
          email: "reader2@example.com",
          phone: "9876543210",
          password: "Reader@123",
        },
        undefined,
        201,
      );
      await req(
        "POST",
        "/auth/signup",
        {
          name: "Reader Two",
          email: "reader2@example.com",
          phone: "9876543210",
          password: "Reader@123",
        },
        undefined,
        409,
      );
      const b = await req("POST", "/auth/login", {
        username: "reader2@example.com",
        password: "Reader@123",
      });
      await req(
        "POST",
        "/operations",
        { action: "borrow", id: 1, name: "Reader", phone: "123" },
        token,
        400,
      );
      await req(
        "POST",
        "/operations",
        { action: "borrow", id: 1, name: "Reader", phone: "9876543210" },
        token,
      );
      await req(
        "POST",
        "/operations",
        { action: "borrow", id: 1, name: "Reader", phone: "9876543210" },
        token,
        409,
      );
      await req(
        "POST",
        "/operations",
        { action: "renew", id: 1, reason: "Still reading" },
        token,
      );
      await req(
        "POST",
        "/operations",
        { action: "renew", id: 1, reason: "Still reading" },
        token,
      );
      await req(
        "POST",
        "/operations",
        { action: "renew", id: 1, reason: "Still reading" },
        token,
        409,
      );
      assert.equal(
        (await req("GET", "/state", undefined, b.accessToken)).borrowedBooks
          .length,
        0,
      );
      await req(
        "POST",
        "/operations",
        { action: "return", id: 1 },
        b.accessToken,
        404,
      );
      await req(
        "POST",
        "/operations",
        { action: "hold", id: 1 },
        b.accessToken,
      );
      await req("POST", "/operations", { action: "return", id: 1 }, token);
      await req(
        "POST",
        "/operations",
        { action: "borrow", id: 1, name: "Reader", phone: "9876543210" },
        token,
        409,
      );
      await req(
        "POST",
        "/operations",
        { action: "borrow", id: 1, name: "Reader Two", phone: "9876543210" },
        b.accessToken,
      );
      await req(
        "POST",
        "/operations",
        { action: "return", id: 1 },
        b.accessToken,
      );
      const book = await req(
        "POST",
        "/books",
        {
          title: "Test book",
          author: "Test Author",
          category: "Technology",
          year: 2025,
        },
        token,
        201,
      );
      await req(
        "PATCH",
        "/books/" + book.id,
        { ...book, title: "Edited book" },
        token,
      );
      await req("DELETE", "/books/" + book.id, undefined, token);
      await req(
        "PATCH",
        "/profile",
        {
          name: "Updated Reader",
          email: "reader2@example.com",
          phone: "9876543210",
        },
        b.accessToken,
      );
      const profile = await req("GET", "/profile", undefined, b.accessToken);
      assert.equal(profile.name, "Updated Reader");
      assert.equal("passwordHash" in profile, false);
      const history = await req("GET", "/history", undefined, token);
      assert.ok(history.some((x) => x.action === "Returned"));
      await req("POST", "/auth/logout", {}, token);
      await req("GET", "/state", undefined, token, 401);
      await req("GET", "/state", undefined, "invalid", 401);
    } finally {
      if (child.exitCode === null) {
        child.kill();
        await once(child, "exit");
      }
      await rm(dir, { recursive: true, force: true });
    }
  },
  { timeout: 20000 },
);
