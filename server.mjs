import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
const path = new URL(process.env.BOOKNEST_DB || "./db.json", import.meta.url);
const db = JSON.parse(await readFile(path, "utf8"));
// Session tokens are opaque, expire in 30 minutes, and are checked by the API.
const sessions = new Map();
const salt = "booknest-local-lab";
const passwordHash = scryptSync("Library@123", salt, 64);
const publicMember = (m) => {
  const { passwordHash, passwordSalt, ...safe } = m;
  return safe;
};
let writes = Promise.resolve();
const save = () => {
  writes = writes.then(() => writeFile(path, JSON.stringify(db, null, 2)));
  return writes;
};
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const date = (days) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
function snapshot(member) {
  return {
    books: db.books,
    member: member ? publicMember(member) : null,
    borrowedBooks: db.borrowings.filter(
      (x) => x.memberId === member?.id && x.status !== "Returned",
    ),
    readingHistory: db.history.filter((x) => x.memberId === member?.id),
    holdRequests: db.holds.filter((x) => x.memberId === member?.id),
  };
}
let queue = Promise.resolve();
const server = http.createServer((req, res) => {
  queue = queue
    .then(async () => {
      const send = (status, data) => {
        res.writeHead(status, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(JSON.stringify(data));
      };
      try {
        const url = new URL(req.url, "http://localhost");
        const route = url.pathname.replace(/^\/api/, "");
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (raw.length > 100000) fail(413, "Request too large");
        }
        let body = {};
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          fail(400, "Invalid JSON");
        }
        if (!body || Array.isArray(body) || typeof body !== "object")
          fail(400, "Expected a JSON object");
        for (const field of [
          "name",
          "email",
          "phone",
          "password",
          "username",
          "title",
          "author",
          "category",
          "description",
          "reason",
        ]) {
          if (
            field in body &&
            (typeof body[field] !== "string" ||
              body[field].length >
                (field === "description"
                  ? 4000
                  : field === "password"
                    ? 128
                    : 500))
          )
            fail(400, "Invalid " + field);
        }
        const token = req.headers.authorization?.replace(/^Bearer /, "");
        const session = sessions.get(token);
        const member =
          session && session.expires > Date.now()
            ? db.members.find((m) => m.id === session.memberId)
            : null;
        const protect = () => {
          if (!member)
            fail(401, "Session expired or invalid. Please log in again.");
        };
        if (route === "/auth/signup" && req.method === "POST") {
          if (
            !body.name?.trim() ||
            !/^\S+@\S+\.\S+$/.test(body.email || "") ||
            !/^\d{10}$/.test(body.phone || "") ||
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(body.password || "")
          )
            fail(
              400,
              "Name, valid email, 10 digit phone and an 8+ character password with upper/lower case and a number are required",
            );
          if (
            db.members.some(
              (m) => m.email.toLowerCase() === body.email.toLowerCase(),
            )
          )
            fail(409, "An account with this email already exists");
          const passwordSalt = randomBytes(16).toString("hex");
          const created = {
            id: "LIB" + Date.now(),
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            phone: body.phone,
            passwordSalt,
            passwordHash: scryptSync(body.password, passwordSalt, 64).toString(
              "hex",
            ),
          };
          db.members.push(created);
          await save();
          return send(201, publicMember(created));
        }
        if (route === "/auth/login" && req.method === "POST") {
          const found = db.members.find(
            (m) =>
              m.id.toLowerCase() === String(body.username).toLowerCase() ||
              m.email.toLowerCase() === String(body.username).toLowerCase(),
          );
          if (
            !found ||
            !timingSafeEqual(
              found.passwordHash
                ? Buffer.from(found.passwordHash, "hex")
                : passwordHash,
              scryptSync(
                String(body.password || ""),
                found.passwordSalt || salt,
                64,
              ),
            )
          )
            fail(401, "Invalid member ID/email or password");
          const accessToken = randomBytes(32).toString("hex");
          const expiresAt = Date.now() + 1800000;
          sessions.set(accessToken, { memberId: found.id, expires: expiresAt });
          return send(200, {
            accessToken,
            expiresAt,
            member: publicMember(found),
          });
        }
        if (route === "/auth/logout") {
          sessions.delete(token);
          return send(200, { ok: true });
        }
        protect();
        if (route === "/state") {
          protect();
          return send(200, snapshot(member));
        }
        if (route === "/members") {
          protect();
          return send(200, db.members.map(publicMember));
        }
        if (route === "/profile") {
          protect();
          if (req.method === "PATCH") {
            if (
              !body.name?.trim() ||
              !/^\S+@\S+\.\S+$/.test(body.email || "") ||
              !/^\d{10}$/.test(body.phone || "")
            )
              fail(400, "Enter a name, valid email and 10 digit phone number");
            if (
              db.members.some(
                (m) =>
                  m.id !== member.id &&
                  m.email.toLowerCase() === body.email.toLowerCase(),
              )
            )
              fail(409, "Email already in use");
            Object.assign(member, {
              name: body.name.trim(),
              email: body.email.trim(),
              phone: body.phone,
            });
            await save();
          }
          return send(200, publicMember(member));
        }
        if (route === "/history" || route === "/borrowings") {
          protect();
          return send(
            200,
            route === "/history"
              ? snapshot(member).readingHistory
              : snapshot(member).borrowedBooks,
          );
        }
        if (route === "/recommendations") {
          const category = url.searchParams.get("category");
          return send(
            200,
            db.books
              .filter(
                (b) =>
                  b.available &&
                  (!category || category === "All" || b.category === category),
              )
              .slice(0, 6),
          );
        }
        if (route === "/books" && req.method === "GET") {
          const q = (url.searchParams.get("q") || "").toLowerCase(),
            c = url.searchParams.get("category");
          return send(
            200,
            db.books.filter(
              (b) =>
                (b.title + " " + b.author).toLowerCase().includes(q) &&
                (!c || c === "All" || b.category === c),
            ),
          );
        }
        const match = route.match(/^\/books\/(\d+)$/);
        if (route === "/books" || match) {
          const book = match
            ? db.books.find((b) => b.id === Number(match[1]))
            : null;
          if (match && !book) fail(404, "Book not found");
          if (req.method === "GET") return send(200, book);
          protect();
          if (req.method === "DELETE") {
            if (!book.available || db.holds.some((h) => h.id === book.id))
              fail(409, "Return this book and resolve holds before deleting");
            db.books = db.books.filter((b) => b.id !== book.id);
            await save();
            return send(200, { ok: true });
          }
          if (
            !body.title?.trim() ||
            !body.author?.trim() ||
            !body.category?.trim() ||
            !Number.isInteger(Number(body.year)) ||
            Number(body.year) < 1000 ||
            Number(body.year) > new Date().getFullYear()
          )
            fail(
              400,
              "Title, author, category and valid published year are required",
            );
          const fields = {
            title: body.title.trim(),
            author: body.author.trim(),
            category: body.category.trim(),
            year: Number(body.year),
            description: body.description || "",
          };
          if (req.method === "POST" && !match) {
            const next = {
              ...fields,
              id: Math.max(0, ...db.books.map((b) => b.id)) + 1,
              available: true,
              rating: 0,
              image: "",
            };
            db.books.push(next);
            await save();
            return send(201, next);
          }
          if (["PATCH", "PUT"].includes(req.method) && book) {
            Object.assign(book, fields);
            await save();
            return send(200, book);
          }
          fail(405, "Method not allowed");
        }
        if (route === "/operations" && req.method === "POST") {
          protect();
          const book = db.books.find((b) => b.id === Number(body.id));
          if (!book) fail(404, "Book not found");
          const loan = db.borrowings.find(
            (x) =>
              x.id === book.id &&
              x.memberId === member.id &&
              x.status !== "Returned",
          );
          let action = "";
          if (body.action === "borrow") {
            if (!book.available)
              fail(409, "Book currently unavailable. Place a hold instead.");
            if (!body.name?.trim() || !/^\d{10}$/.test(body.phone || ""))
              fail(400, "Member name and 10 digit phone number are required");
            const firstHold = db.holds.find((h) => h.id === book.id);
            if (firstHold && firstHold.memberId !== member.id)
              fail(
                409,
                "This copy is reserved for the first member in the hold queue",
              );
            book.available = false;
            db.borrowings.push({
              ...book,
              memberId: member.id,
              dueDate: date(14),
              status: "Borrowed",
              renewals: 0,
            });
            db.holds = db.holds.filter(
              (h) => !(h.id === book.id && h.memberId === member.id),
            );
            action = "Borrowed";
          } else if (body.action === "hold") {
            if (book.available || loan)
              fail(
                409,
                "Holds are only for unavailable books borrowed by another member",
              );
            if (
              db.holds.some((h) => h.id === book.id && h.memberId === member.id)
            )
              fail(409, "Hold already requested");
            db.holds.push({
              ...book,
              memberId: member.id,
              date: date(0),
              status: "Hold Requested",
            });
            action = "Placed on hold";
          } else if (body.action === "return") {
            if (!loan) fail(404, "Borrowing record not found");
            loan.status = "Returned";
            book.available = true;
            action = "Returned";
          } else if (body.action === "renew") {
            if (!loan) fail(404, "Borrowing record not found");
            if (
              loan.renewals >= 2 ||
              loan.dueDate < date(0) ||
              db.holds.some((h) => h.id === book.id)
            )
              fail(
                409,
                "Book renewal is not available (overdue, held, or renewal limit reached)",
              );
            if (!body.reason?.trim()) fail(400, "Renewal reason is required");
            loan.dueDate = new Date(Date.parse(loan.dueDate) + 7 * 86400000)
              .toISOString()
              .slice(0, 10);
            loan.renewals++;
            loan.status = "Renewed";
            action = "Renewed";
          } else fail(400, "Unknown operation");
          db.history.push({
            id: book.id,
            title: book.title,
            author: book.author,
            memberId: member.id,
            action,
            date: date(0),
          });
          await save();
          return send(200, snapshot(member));
        }
        fail(404, "API endpoint not found");
      } catch (e) {
        send(e.status || 500, {
          message: e.status ? e.message : "Server could not save the request",
        });
      }
    })
    .catch(console.error);
});
server.listen(Number(process.env.PORT || 3001), "127.0.0.1", () => {
  console.log(
    `BookNest API ready at http://127.0.0.1:${server.address().port}`,
  );
});
