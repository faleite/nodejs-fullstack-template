const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de Health Check (Verifica se o backend está vivo)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend está rodando!',
    timestamp: new Date().toISOString()
  });
});

// Suas rotas de negócio serão adicionadas abaixo...

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
