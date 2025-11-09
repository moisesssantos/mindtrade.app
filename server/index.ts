import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

const app = express();

// Permite o uso do rawBody em requisições (mantém igual)
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Middlewares padrão
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// 🔧 CORS configurado para permitir o front hospedado no Render
app.use(
  cors({
    origin: [
      "https://mindtrade-app-1.onrender.com", // front no Render
      "http://localhost:5173", // dev local
    ],
    credentials: true,
  })
);

// Logger de requisições (mantém seu sistema de logs original)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Middleware de erro
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // ⚙️ Ambiente de desenvolvimento usa Vite, produção só serve a API
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    log("Produção: servindo apenas rotas da API (sem client embutido).");
  }

  // Porta padrão do Render
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`Servidor rodando na porta ${port}`);
    }
  );
})();
