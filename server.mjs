import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";

// ---------- Database ----------

const databasePath = new URL(
  process.env.BOOKNEST_DB || "./db.json",
  import.meta.url
);

const db = JSON.parse(
  await readFile(databasePath, "utf8")
);

const sessions = new Map();

const demoSalt = "booknest-local-lab";
const demoPasswordHash = scryptSync(
  "Library@123",
  demoSalt,
  64
);

let writes = Promise.resolve();

function save() {
  // Keep the write queue usable after an earlier write failure.
  writes = writes
    .catch(() => {})
    .then(() =>
      writeFile(
        databasePath,
        JSON.stringify(db, null, 2)
      )
    );

  return writes;
}

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

function date(days = 0) {
  return new Date(Date.now() + days * 86400000)
    .toISOString()
    .slice(0, 10);
}

function publicMember(member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone || ""
  };
}

function snapshot(member) {
  return {
    books: db.books,
    member: publicMember(member),

    borrowedBooks: db.borrowings.filter(
      item =>
        item.memberId === member.id &&
        item.status !== "Returned"
    ),

    readingHistory: db.history.filter(
      item => item.memberId === member.id
    ),

    holdRequests: db.holds.filter(
      item => item.memberId === member.id
    )
  };
}

// ---------- Validation ----------

function validateBody(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    fail(400, "Expected a JSON object.");
  }

  const fields = [
    "name",
    "email",
    "phone",
    "password",
    "username",
    "title",
    "author",
    "category",
    "description",
    "reason"
  ];

  for (const field of fields) {
    const limit =
      field === "description"
        ? 4000
        : field === "password"
          ? 128
          : 500;

    if (
      field in body &&
      (
        typeof body[field] !== "string" ||
        body[field].length > limit
      )
    ) {
      fail(400, `Invalid ${field}.`);
    }
  }
}

function validateProfile(body) {
  if (
    !body.name?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || "") ||
    !/^\d{10}$/.test(body.phone || "")
  ) {
    fail(
      400,
      "Enter a name, valid email and 10 digit phone number."
    );
  }
}

function validateBook(body) {
  const year = Number(body.year);

  if (
    !body.title?.trim() ||
    !body.author?.trim() ||
    !body.category?.trim() ||
    !Number.isInteger(year) ||
    year < 1000 ||
    year > new Date().getFullYear()
  ) {
    fail(
      400,
      "Title, author, category and valid published year are required."
    );
  }

  return {
    title: body.title.trim(),
    author: body.author.trim(),
    category: body.category.trim(),
    year,
    description: body.description || ""
  };
}

// ---------- CORS ----------

const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
);

// ---------- Server ----------

let queue = Promise.resolve();

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const allowed = origin && allowedOrigins.has(origin);

  res.setHeader("Vary", "Origin");

  if (allowed) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  const send = (status, data) => {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });

    res.end(JSON.stringify(data));
  };

  if (req.method === "OPTIONS") {
    res.writeHead(allowed ? 204 : 403);
    res.end();
    return;
  }

  // Public endpoint for Render health checks.
  if (
    req.method === "GET" &&
    ["/", "/health", "/api/health"].includes(req.url)
  ) {
    send(200, {
      status: "ok",
      service: "BookNest API"
    });
    return;
  }

  // Serialize database operations.
  queue = queue
    .then(async () => {
      try {
        const url = new URL(
          req.url,
          "http://localhost"
        );

        if (!url.pathname.startsWith("/api/")) {
          fail(404, "API endpoint not found.");
        }

        const route = url.pathname.slice(4);

        let raw = "";

        for await (const chunk of req) {
          raw += chunk;

          if (Buffer.byteLength(raw) > 100000) {
            fail(413, "Request too large.");
          }
        }

        let body = {};

        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          fail(400, "Invalid JSON.");
        }

        validateBody(body);

        const token = req.headers.authorization
          ?.replace(/^Bearer /, "");

        const session = sessions.get(token);

        if (session && session.expires <= Date.now()) {
          sessions.delete(token);
        }

        const member =
          session && session.expires > Date.now()
            ? db.members.find(
                item => item.id === session.memberId
              )
            : null;

        const protect = () => {
          if (!member) {
            fail(
              401,
              "Session expired or invalid. Please log in again."
            );
          }
        };

        // ---------- Register ----------

        if (
          route === "/auth/signup" &&
          req.method === "POST"
        ) {
          validateProfile(body);

          if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/
              .test(body.password || "")
          ) {
            fail(
              400,
              "Password must have 8+ characters, uppercase, lowercase and a number."
            );
          }

          const email = body.email
            .trim()
            .toLowerCase();

          if (
            db.members.some(
              item => item.email.toLowerCase() === email
            )
          ) {
            fail(
              409,
              "An account with this email already exists."
            );
          }

          const passwordSalt = randomBytes(16)
            .toString("hex");

          const created = {
            id:
              "LIB" +
              Date.now() +
              randomBytes(3).toString("hex"),
            name: body.name.trim(),
            email,
            phone: body.phone,
            passwordSalt,
            passwordHash: scryptSync(
              body.password,
              passwordSalt,
              64
            ).toString("hex")
          };

          db.members.push(created);
          await save();

          send(201, publicMember(created));
          return;
        }

        // ---------- Login ----------

        if (
          route === "/auth/login" &&
          req.method === "POST"
        ) {
          const username = (body.username || "")
            .trim()
            .toLowerCase();

          const found = db.members.find(
            item =>
              item.id.toLowerCase() === username ||
              item.email.toLowerCase() === username
          );

          let validPassword = false;

          if (found) {
            if (found.passwordHash && found.passwordSalt) {
              const storedHash = Buffer.from(
                found.passwordHash,
                "hex"
              );

              const suppliedHash = scryptSync(
                body.password || "",
                found.passwordSalt,
                64
              );

              validPassword =
                storedHash.length === suppliedHash.length &&
                timingSafeEqual(storedHash, suppliedHash);
            } else if (found.id === "LIB101") {
              validPassword = timingSafeEqual(
                demoPasswordHash,
                scryptSync(
                  body.password || "",
                  demoSalt,
                  64
                )
              );
            }
          }

          if (!found || !validPassword) {
            fail(
              401,
              "Invalid member ID/email or password."
            );
          }

          const accessToken = randomBytes(32)
            .toString("hex");

          const expiresAt =
            Date.now() + 30 * 60 * 1000;

          sessions.set(accessToken, {
            memberId: found.id,
            expires: expiresAt
          });

          send(200, {
            accessToken,
            expiresAt,
            member: publicMember(found)
          });

          return;
        }

        // ---------- Logout ----------

        if (
          route === "/auth/logout" &&
          req.method === "POST"
        ) {
          sessions.delete(token);
          send(200, { ok: true });
          return;
        }

        // All following API routes require authentication.
        protect();

        // ---------- Shared State ----------

        if (
          route === "/state" &&
          req.method === "GET"
        ) {
          send(200, snapshot(member));
          return;
        }

        // ---------- Members ----------

        if (
          route === "/members" &&
          req.method === "GET"
        ) {
          send(200, db.members.map(publicMember));
          return;
        }

        // ---------- Profile ----------

        if (route === "/profile") {
          if (req.method === "PATCH") {
            validateProfile(body);

            const email = body.email
              .trim()
              .toLowerCase();

            if (
              db.members.some(
                item =>
                  item.id !== member.id &&
                  item.email.toLowerCase() === email
              )
            ) {
              fail(409, "Email already in use.");
            }

            Object.assign(member, {
              name: body.name.trim(),
              email,
              phone: body.phone
            });

            await save();
          } else if (req.method !== "GET") {
            fail(405, "Method not allowed.");
          }

          send(200, publicMember(member));
          return;
        }

        // ---------- History and Borrowings ----------

        if (
          req.method === "GET" &&
          (
            route === "/history" ||
            route === "/borrowings"
          )
        ) {
          const state = snapshot(member);

          send(
            200,
            route === "/history"
              ? state.readingHistory
              : state.borrowedBooks
          );

          return;
        }

        // ---------- Recommendations ----------

        if (
          route === "/recommendations" &&
          req.method === "GET"
        ) {
          const category = url.searchParams
            .get("category");

          const recommendations = db.books
            .filter(
              book =>
                book.available &&
                (
                  !category ||
                  category === "All" ||
                  book.category === category
                )
            )
            .slice(0, 6);

          send(200, recommendations);
          return;
        }

        // ---------- Book List ----------

        if (
          route === "/books" &&
          req.method === "GET"
        ) {
          const query = (
            url.searchParams.get("q") || ""
          ).toLowerCase();

          const category = url.searchParams
            .get("category");

          const books = db.books.filter(
            book =>
              (book.title + " " + book.author)
                .toLowerCase()
                .includes(query) &&
              (
                !category ||
                category === "All" ||
                book.category === category
              )
          );

          send(200, books);
          return;
        }

        // ---------- Book CRUD ----------

        const match = route.match(
          /^\/books\/(\d+)$/
        );

        if (route === "/books" || match) {
          const book = match
            ? db.books.find(
                item => item.id === Number(match[1])
              )
            : null;

          if (match && !book) {
            fail(404, "Book not found.");
          }

          if (req.method === "GET" && book) {
            send(200, book);
            return;
          }

          if (
            req.method === "POST" &&
            route === "/books"
          ) {
            const fields = validateBook(body);

            const created = {
              ...fields,
              id:
                Math.max(
                  0,
                  ...db.books.map(item => item.id)
                ) + 1,
              available: true,
              rating: 0,
              image: ""
            };

            db.books.push(created);
            await save();

            send(201, created);
            return;
          }

          if (
            book &&
            ["PATCH", "PUT"].includes(req.method)
          ) {
            Object.assign(
              book,
              validateBook(body)
            );

            await save();
            send(200, book);
            return;
          }

          if (book && req.method === "DELETE") {
            if (
              !book.available ||
              db.holds.some(
                item => item.id === book.id
              )
            ) {
              fail(
                409,
                "Return this book and resolve holds before deleting."
              );
            }

            db.books = db.books.filter(
              item => item.id !== book.id
            );

            await save();
            send(200, { ok: true });
            return;
          }

          fail(405, "Method not allowed.");
        }

        // ---------- Borrowing Operations ----------

        if (
          route === "/operations" &&
          req.method === "POST"
        ) {
          const book = db.books.find(
            item => item.id === Number(body.id)
          );

          if (!book) {
            fail(404, "Book not found.");
          }

          const loan = db.borrowings.find(
            item =>
              item.id === book.id &&
              item.memberId === member.id &&
              item.status !== "Returned"
          );

          let action = "";

          if (body.action === "borrow") {
            if (!book.available) {
              fail(
                409,
                "Book currently unavailable. Place a hold instead."
              );
            }

            if (
              !body.name?.trim() ||
              !/^\d{10}$/.test(body.phone || "")
            ) {
              fail(
                400,
                "Member name and 10 digit phone number are required."
              );
            }

            const firstHold = db.holds.find(
              item => item.id === book.id
            );

            if (
              firstHold &&
              firstHold.memberId !== member.id
            ) {
              fail(
                409,
                "This copy is reserved for the first member in the hold queue."
              );
            }

            book.available = false;

            db.borrowings.push({
              ...book,
              memberId: member.id,
              dueDate: date(14),
              status: "Borrowed",
              renewals: 0
            });

            db.holds = db.holds.filter(
              item =>
                !(
                  item.id === book.id &&
                  item.memberId === member.id
                )
            );

            action = "Borrowed";
          } else if (body.action === "hold") {
            if (book.available || loan) {
              fail(
                409,
                "Holds are only for unavailable books borrowed by another member."
              );
            }

            if (
              db.holds.some(
                item =>
                  item.id === book.id &&
                  item.memberId === member.id
              )
            ) {
              fail(409, "Hold already requested.");
            }

            db.holds.push({
              ...book,
              memberId: member.id,
              date: date(),
              status: "Hold Requested"
            });

            action = "Placed on hold";
          } else if (body.action === "return") {
            if (!loan) {
              fail(404, "Borrowing record not found.");
            }

            loan.status = "Returned";
            book.available = true;
            action = "Returned";
          } else if (body.action === "renew") {
            if (!loan) {
              fail(404, "Borrowing record not found.");
            }

            if (
              loan.renewals >= 2 ||
              loan.dueDate < date() ||
              db.holds.some(
                item => item.id === book.id
              )
            ) {
              fail(
                409,
                "Book renewal is not available: overdue, held or renewal limit reached."
              );
            }

            if (!body.reason?.trim()) {
              fail(400, "Renewal reason is required.");
            }

            loan.dueDate = new Date(
              Date.parse(loan.dueDate) +
              7 * 86400000
            )
              .toISOString()
              .slice(0, 10);

            loan.renewals++;
            loan.status = "Renewed";
            action = "Renewed";
          } else {
            fail(400, "Unknown operation.");
          }

          db.history.push({
            id: book.id,
            title: book.title,
            author: book.author,
            memberId: member.id,
            action,
            date: date()
          });

          await save();

          send(200, snapshot(member));
          return;
        }

        fail(404, "API endpoint not found.");
      } catch (error) {
        send(error.status || 500, {
          message: error.status
            ? error.message
            : "Server could not process the request."
        });
      }
    })
    .catch(error => {
      console.error("Request processing failed:", error.message);

      if (!res.writableEnded) {
        if (!res.headersSent) {
          send(500, {
            message: "Server error."
          });
        } else {
          res.end();
        }
      }
    });
});

// ---------- Start ----------

const port = Number(process.env.PORT || 3001);

server.listen(port, "0.0.0.0", () => {
  console.log(
    `BookNest API running on port ${server.address().port}`
  );
});