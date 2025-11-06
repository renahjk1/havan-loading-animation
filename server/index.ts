import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para escapar XML
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Rota para gerar certificado
  app.get("/api/certificate", async (req, res) => {
    try {
      const { nome, cpf } = req.query as { nome?: string; cpf?: string };

      if (!nome || !cpf) {
        return res.status(400).json({
          error: "Parâmetros obrigatórios: nome e cpf",
          example: "/api/certificate?nome=João Silva&cpf=123.456.789-00",
        });
      }

      // Caminho da imagem template
      const templatePath = path.join(
        __dirname,
        "..",
        "client",
        "public",
        "certificate-template.png"
      );

      // Verificar se o arquivo existe
      if (!fs.existsSync(templatePath)) {
        return res.status(404).json({
          error: "Arquivo template não encontrado",
        });
      }

      // Carregar imagem base
      let image = sharp(templatePath);

      // Obter dimensões da imagem
      const metadata = await image.metadata();
      const width = metadata.width || 400;
      const height = metadata.height || 600;

      // Criar SVG com textos sobrepostos
      const svgText = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <!-- Nome (após "NOME:") - mesma fonte do LIMITE -->
          <text x="120" y="215" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#003366" letter-spacing="0.5">
            ${escapeXml(nome.toUpperCase())}
          </text>
          
          <!-- CPF (após "CPF:") - mesma fonte do LIMITE -->
          <text x="120" y="245" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#003366" letter-spacing="0.5">
            ${escapeXml(cpf)}
          </text>
          
          <!-- Titular do Cartão (nome do titular) - mesma fonte da data de vencimento -->
          <text x="55" y="445" font-family="Arial, sans-serif" font-size="12" fill="white" letter-spacing="1">
            ${escapeXml(nome.toUpperCase())}
          </text>
        </svg>
      `;

      // Converter SVG para buffer
      const svgBuffer = Buffer.from(svgText);

      // Sobrepor SVG na imagem
      const result = await image
        .composite([
          {
            input: svgBuffer,
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer();

      // Definir headers de resposta
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="certificado-${nome.replace(/\s+/g, "-")}.png"`
      );

      res.send(result);
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      res.status(500).json({
        error: "Falha ao gerar certificado",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
