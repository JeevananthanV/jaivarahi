// ============================================================
// server.js — jaivarahi.org backend (Production Ready)
// ============================================================

// ─── STEP 1: Load env vars FIRST via side-effect import ──────
// WHY: With ES modules, all `import` statements are HOISTED and
// run BEFORE any code in this file — including dotenv.config().
// So paymentRoutes.js (which calls `new Razorpay(...)` at the
// module level) would see empty env vars and crash.
// SOLUTION: Put dotenv.config() in a separate file (env.js) and
// import it first — Node resolves it before other imports.
import "./env.js";

// ─── STEP 2: All other imports (env vars now available) ───────
import express           from "express";
import cors              from "cors";
import helmet            from "helmet";
import compression       from "compression";
import rateLimit         from "express-rate-limit";
import fs, { existsSync }    from "fs";
import path              from "path";
import { fileURLToPath } from "url";

// Route imports — env vars are loaded by now
import paymentRoutes     from "./routes/paymentRoutes.js";
import astavarahi2Routes from "./routes/astavarahi2Routes.js";
import bookingRoutes     from "./routes/bookingRoutes.js";
import serviceBookingRoutes from "./routes/serviceBookingRoutes.js";
import serviceCategoryRoutes from "./routes/serviceCategoryRoutes.js";
import serviceRoutes     from "./routes/serviceRoutes.js";
import servicePaymentRoutes from "./routes/servicePaymentRoutes.js";
import serviceNotificationRoutes from "./routes/serviceNotificationRoutes.js";
import serviceReportRoutes from "./routes/serviceReportRoutes.js";
import serviceExportRoutes from "./routes/serviceExportRoutes.js";
import adminRoutes, { loginAdmin } from "./admin-routes.js";
import packageCategoryRoutes from "./routes/packageCategoryRoutes.js";
import jothidamRoutes from "./routes/jothidamRoutes.js";
import devoteeRoutes from "./routes/devoteeRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import { getBlogSitemapXml } from "./controllers/blogController.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import pool               from "./db/pool.js";

// ─── CONSTANTS ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const isProd     = process.env.NODE_ENV === "production";
const env        = (primary, fallback) => process.env[primary] || process.env[fallback] || "";
const startedAt  = Date.now();

// ─── VALIDATE CRITICAL ENV VARS ───────────────────────────────
const requiredVars = [
    "ADMIN_JWT_SECRET",
    "MYSQL_HOST",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
    "VITE_RAZORPAY_KEY",
    "RAZORPAY_KEY_SECRET",
];

const missing = requiredVars.filter(v => {
    if (process.env[v]) return false;
    if (v.startsWith("MYSQL_")) {
        return !process.env[v.replace("MYSQL_", "DB_")];
    }
    return true;
});
if (missing.length) {
    console.error("❌ CRITICAL: Missing environment variables:", missing.join(", "));
    if (isProd) process.exit(1);
}

if (process.env.ADMIN_JWT_SECRET === "replace_with_strong_secret") {
    console.error("❌ CRITICAL: ADMIN_JWT_SECRET is still the default value!");
    if (isProd) process.exit(1);
}

// ─── APP INIT ─────────────────────────────────────────────────
const app = express();
app.locals.db = pool;

// Required behind cPanel/Apache/Passenger proxy
// Ensures correct IP for rate limiting
app.set("trust proxy", 1);

// ─── SECURITY HEADERS ─────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false,       // Razorpay loads external scripts
    crossOriginEmbedderPolicy: false,
}));

// ─── SEO MIDDLEWARE ────────────────────────────────────────────
// Sets SEO-related headers for all responses
app.use((req, res, next) => {
    // X-Robots-Tag: Allow indexing on main pages, disallow on admin
    if (req.path.startsWith("/admin")) {
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
    } else {
        res.setHeader("X-Robots-Tag", "index, follow, max-snippet:-1, max-image-preview:large");
    }

    // Canonical URL header
    const host = req.get("host") || "www.jaivarahi.org";
    const canonicalUrl = `https://${host}${req.path}`;
    res.setHeader("Link", `<${canonicalUrl}>; rel="canonical"`);

    next();
});

// ─── COMPRESSION ──────────────────────────────────────────────
app.use(compression());

// ─── BODY PARSERS ─────────────────────────────────────────────
app.use(express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── CORS ─────────────────────────────────────────────────────
const devOrigins = isProd ? [] : [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    "http://127.0.0.1:5177",
];

const envOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

const allowedOrigins = [...new Set([
    ...envOrigins,
    ...devOrigins,
    "https://jaivarahi.org",
    "https://www.jaivarahi.org",
])];

const corsOriginHandler = (origin, callback) => {
    if (!origin) return callback(null, true); // Allow curl, mobile, server-to-server
    if (!isProd && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.error(`🚫 CORS blocked: ${origin}`);
    callback(new Error(`CORS policy does not allow origin: ${origin}`));
};

const corsOptions = {
    origin: corsOriginHandler,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ─── RATE LIMITING ────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Try again after 15 minutes." },
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isProd ? 10 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Try again after 1 hour." },
});

const paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many payment requests. Please slow down." },
});

const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions. Please wait a few minutes before trying again." },
});

// ─── STATIC FILES — DIST PATH RESOLUTION ───────────────────────
// You told us the build output is pasted directly into public_html.
// On cPanel/Passenger, __dirname for this file is usually something like:
//   /home/jaivarahi/domains/jaivarahi.org/backend
// and the sibling folder actually holding the built frontend is:
//   /home/jaivarahi/domains/jaivarahi.org/public_html
// The OLD code tried "../public_html" LAST (after "../frontend/dist"),
// and never told you which paths it actually checked — so a bad guess
// silently won and you got the 503 fallback page.
// FIX: build an explicit, ordered candidate list, log every path we
// check and whether it has an index.html, and pick the first REAL match.
function resolveDistPath() {
    const candidates = [
        process.env.DIST_PATH,
        path.resolve(__dirname, "public_html"),        // same level as server.js
        path.resolve(__dirname, "../public_html"),      // one level up (most common cPanel layout)
        path.resolve(__dirname, "../../public_html"),   // two levels up, just in case
        path.resolve(process.cwd(), "public_html"),      // relative to wherever Passenger launches from
        path.resolve(__dirname, "../frontend/dist"),     // fallback: separate frontend repo build
    ].filter(Boolean);

    console.log("\n🔍 Resolving frontend dist path...");
    for (const candidate of candidates) {
        const hasIndex = existsSync(path.join(candidate, "index.html"));
        const exists   = existsSync(candidate);
        console.log(`   ${exists ? "📁" : "  "} ${candidate} ${exists ? (hasIndex ? "✅ has index.html" : "⚠️  exists, no index.html") : "✗ not found"}`);
        if (exists && hasIndex) return candidate;
    }

    // Nothing had an index.html — fall back to the first existing dir (may still 503),
    // or the first candidate at all so error messages are meaningful.
    const firstExisting = candidates.find(existsSync);
    return firstExisting || candidates[0];
}

const distPath = resolveDistPath();
const distHasIndex = existsSync(path.join(distPath, "index.html"));

const uploadsDir = path.resolve(__dirname, "uploads");
if (!existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const staticUploadOptions = {
    index: false,
    maxAge: isProd ? "30d" : 0,
    etag: true,
    setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
    }
};
app.use("/uploads", express.static(uploadsDir, staticUploadOptions));
app.use("/api/uploads", express.static(uploadsDir, staticUploadOptions));

if (!distHasIndex) {
    console.warn(`⚠️  Frontend index.html NOT found under: ${distPath}`);
    console.warn(`   Set DIST_PATH explicitly in your cPanel env vars to override this.`);
} else {
    console.log(`✅ Serving static files from: ${distPath}`);
    app.use(express.static(distPath, {
        maxAge: isProd ? "7d" : 0,
        etag: true,
        index: false, // Catch-all route handles index.html
    }));
}

// ─── API ROUTES ───────────────────────────────────────────────
app.use("/api", generalLimiter);
// ─── API ROUTE MOUNTINGS ──────────────────────────────────────
app.use("/api/payments", paymentLimiter);
app.use("/api/payments", paymentRoutes);
app.use("/api/astavarahi2", astavarahi2Routes);
app.use("/api/bookings", bookingRoutes);

app.use("/api/devotees", submissionLimiter);
app.use("/api/services/book", submissionLimiter);
app.use("/api/jothidam/book", submissionLimiter);
app.use("/api/astavarahi2/free-entry", submissionLimiter);

app.use("/api/services", serviceBookingRoutes);
app.use("/api/services/categories", serviceCategoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/services/payment", servicePaymentRoutes);
app.use("/api/services/notifications", serviceNotificationRoutes);
app.use("/api/services/reports", serviceReportRoutes);
app.use("/api/services/export", serviceExportRoutes);

app.post("/api/admin/login", authLimiter, loginAdmin);
app.use("/api/admin", adminRoutes);
app.use("/api/package-categories", packageCategoryRoutes);

// Admin-specific mappings for SMS and Notifications
app.use("/api/admin/services/notifications", serviceNotificationRoutes);
app.use("/api/jothidam", jothidamRoutes);
app.use("/api", devoteeRoutes);
app.use("/api", blogRoutes);
app.use("/api", mediaRoutes);
app.get("/sitemap-blogs.xml", getBlogSitemapXml);
app.use("/api/webhooks", webhookRoutes);

// Static uploads serving for blog images and assets
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath, { maxAge: "30d" }));
app.use("/api/uploads", express.static(uploadsPath, { maxAge: "30d" }));


// ─── HEALTH CHECK ─────────────────────────────────────────────
// Now actually verifies the DB connection (not just "pool object exists"),
// reports dist/static file status, memory, and uptime — so you can tell
// at a glance whether a 503 is a DB problem, a build problem, or neither.
app.get("/health", async (_req, res) => {
    const checks = {
        env: process.env.NODE_ENV || "unknown",
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        timestamp: new Date().toISOString(),
        razorpay: {
            configured: !!(process.env.VITE_RAZORPAY_KEY && process.env.RAZORPAY_KEY_SECRET),
        },
        database: { configured: !!pool, connected: false },
        frontend: {
            distPath,
            indexHtmlFound: distHasIndex,
        },
        memory: {
            rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
    };

    try {
        if (pool) {
            await pool.query("SELECT 1");
            checks.database.connected = true;
        }
    } catch (err) {
        checks.database.connected = false;
        checks.database.error = isProd ? "DB query failed" : err.message;
    }

    const healthy = checks.database.connected;
    res.status(healthy ? 200 : 503).json({
        status: healthy ? "ok" : "degraded",
        ...checks,
    });
});

app.get("/health/frontend", (_req, res) => {
    res.status(distHasIndex ? 200 : 503).json({
        status: distHasIndex ? "ok" : "missing_index",
        distPath,
        indexHtmlFound: distHasIndex,
    });
});

// ─── API CATCH-ALL (404) ──────────────────────────────────────
app.use("/api", (req, res) => {
    console.warn(`⚠️  404 API Route Not Found: [${req.method}] ${req.originalUrl}`);
    res.status(404).json({ error: `API route not found: [${req.method}] ${req.originalUrl}` });
});

// ─── CATCH-ALL FOR REACT ROUTER ───────────────────────────────
app.get("*", (req, res) => {

    if (!distHasIndex) {
        return res.status(503).send(
            "Frontend not deployed correctly. No index.html was found. " +
            `Checked: ${distPath}. Set DIST_PATH in your cPanel env vars to the correct folder.`
        );
    }

    const htmlFile = req.path.startsWith("/admin") ? "admin.html" : "index.html";
    const filePath = path.join(distPath, htmlFile);
    const fallback = path.join(distPath, "index.html");

    if (existsSync(filePath)) return res.sendFile(filePath);
    if (existsSync(fallback)) return res.sendFile(fallback);

    res.status(503).send("Frontend not deployed. Upload build to public_html.");
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    console.error("❌ Unhandled error:", err.message || err);
    res.status(err.status || 500).json({
        error: isProd ? "Internal server error." : (err.message || "Unknown error"),
    });
});

// ─── PROCESS-LEVEL SAFETY NETS ─────────────────────────────────
// Without these, one unhandled promise rejection anywhere in the app
// (a stray .then() with no .catch, a missing await) can silently crash
// the whole Passenger process with no useful log line.
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    // Let Passenger/cPanel restart the process rather than limping along in a bad state.
    process.exit(1);
});

// Helper to print all registered routes dynamically
function logRoutes(app) {
    console.log("🛣️  Registered API routes:");
    const routes = [];
    function parseStack(stack, prefix = "") {
        stack.forEach((middleware) => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods).join(", ").toUpperCase();
                routes.push(`   [${methods}] ${prefix}${middleware.route.path}`);
            } else if (middleware.name === "router") {
                const basePath = middleware.regexp.source
                    .replace("^\\", "")
                    .replace("\\/?(?=\\/|$)", "")
                    .replace("(?=\\/|$)", "")
                    .replace("\\", "");
                parseStack(middleware.handle.stack, prefix + (basePath.startsWith("/") ? "" : "/") + basePath);
            }
        });
    }
    parseStack(app._router.stack);
    // Sort and print unique routes
    [...new Set(routes)].sort().forEach(r => console.log(r));
}

// ─── SERVER STARTUP ───────────────────────────────────────────
const preferredPort = parseInt(process.env.PORT || "5000", 10);
let port = preferredPort;

function startServer(portToTry) {
    const server = app.listen(portToTry, "0.0.0.0", () => {
        console.log("\n============================================================");
        console.log(`🚀 Server running in ${isProd ? "PRODUCTION" : "DEVELOPMENT"} mode`);
        console.log(`   Port              : ${portToTry}`);
        console.log(`   NODE_ENV          : ${process.env.NODE_ENV}`);
        console.log(`   VITE_RAZORPAY_KEY : ${process.env.VITE_RAZORPAY_KEY ? "✓ set" : "✗ MISSING"}`);
        console.log(`   MYSQL_HOST        : ${env("MYSQL_HOST", "DB_HOST")}`);
        console.log(`   Dist path         : ${distPath} ${distHasIndex ? "(✓ index.html found)" : "(✗ NO index.html — site will 503)"}`);
        console.log(`   Allowed origins   : ${allowedOrigins.join(", ")}`);
        console.log(`   Health check      : GET /health`);
        console.log("============================================================\n");
        logRoutes(app);
        console.log("");
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.warn(`⚠️  Port ${portToTry} is already in use.`);
            if (!isProd) {
                const nextPort = portToTry + 1;
                console.log(`   Trying next port: ${nextPort}...`);
                startServer(nextPort);
                return;
            }
            console.error(`❌ Could not find an available port starting from ${preferredPort}.`);
        } else {
            console.error("❌ Server failed to start:", err.message);
        }
        process.exit(1);
    });
}

startServer(port);

// ─── GRACEFUL SHUTDOWN (for Passenger/cPanel) ─────────────────
const shutdown = (signal) => {
    console.log(`\n${signal} — shutting down gracefully...`);
    server.close(() => {
        pool.end(() => {
            console.log("✅ DB pool closed. Bye.");
            process.exit(0);
        });
    });
    setTimeout(() => process.exit(1), 10000); // Force exit after 10s
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));