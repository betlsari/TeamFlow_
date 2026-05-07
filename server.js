const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const passport = require("./src/config/passport");
const authRoutes = require("./src/routes/authRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const labelRoutes = require("./src/routes/labelRoutes");
const sprintRoutes = require("./src/routes/sprintRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const docsRoutes = require("./src/routes/docsRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const requestLogger = require("./src/middleware/requestLogger");

const app = express();

// Güvenlik
app.use(helmet());
const corsOptions = require("./src/config/cors");
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport başlatma
app.use(passport.initialize());

// Loglama
app.use(requestLogger);

// Rate limiting (auth endpoint'leri için brute-force koruması)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20,
  message: { success: false, message: "Çok fazla istek, lütfen bekleyin" },
});

// ─── Route'lar ───────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/notifications", notificationRoutes); // Auth middleware router içinde tanımlı

// Kişi B route'ları
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/labels", labelRoutes);

// Kişi C route'ları
app.use("/api/sprints", sprintRoutes);
app.use("/api/comments", commentRoutes);

// Swagger dokümantasyonu
app.use("/api/docs", docsRoutes);

// Sağlık kontrolü
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Sunucu çalışıyor" });
});

// Global hata yakalama (en sona eklenmelidir)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
