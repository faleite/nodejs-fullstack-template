# Guia Completo: Ambiente de Desenvolvimento Local com Docker, Nginx, Node.js, Prisma e PostgreSQL

Este documento sintetiza todo o conhecimento, conceitos de sistemas operacionais/linguagem C, arquitetura e arquivos criados durante a montagem passo a passo do ambiente local de desenvolvimento.

---

## 1. Visão Geral da Arquitetura

```txt
   [ Browser (Navegador) ]
              │
              │ HTTP (Porta 80 pública no host)
              ▼
   ┌──────────────────────────────────┐
   │     Nginx (Proxy Reverso)        │
   │ - Servir frontend estático       │
   │ - Encaminhar /api para o backend │
   └────────────────┬─────────────────┘
                    │ Rede interna Docker (Bridge Network)
                    ▼
   ┌──────────────────────────────────┐
   │     Backend (Node.js/Express)    │
   │ - API REST                       │
   │ - Prisma ORM                     │
   └────────────────┬─────────────────┘
                    │ Conexão TCP / Socket
                    ▼
   ┌──────────────────────────────────┐
   │      PostgreSQL (Database)       │
   │ - Volume persistente no disco    │
   └──────────────────────────────────┘
```

---

## 2. Conceitos de Sistemas e Analogias com a Linguagem C e S.O.

| Conceito Web / Docker | Conceito em C / Sistema Operacional | Explicação Didática |
| :--- | :--- | :--- |
| **Imagem Docker** | Binário/Executável Compilado | Foto estática e imutável do sistema de arquivos e do programa pronto para rodar. |
| **Contêiner** | Processo em execução isolado | Instância de uma imagem rodando na memória dentro de *namespaces* Linux isolados. |
| **Dockerfile** | Instruções de Compilação / Makefile | Script declarativo com os passos necessários para compilar/montar a imagem. |
| **Docker Compose** | Makefile de Orquestração | Utilitário que automatiza a criação, rede e execução de múltiplos contêineres juntos. |
| **Named Volume** | Ponto de Montagem (`mount()`) | Diretório gerenciado no disco host montado dentro do contêiner para persistir dados. |
| **Bind Mount** | Espelhamento de Disco (`mount --bind`) | Mapeia uma pasta do host para o contêiner em tempo real, permitindo *hot-reloading*. |
| **Bridge Network** | Ponte de Rede Virtual (`brctl` / `veth`) | Sub-rede virtual interna onde contêineres conversam por IP ou DNS de serviço. |
| **ORM (Prisma)** | Abstração sobre `structs` e Sockets | Mapeia tabelas do SQL para objetos da linguagem e gera queries de forma segura. |
| **Proxy Reverso** | Gerenciador de Sockets / Roteador | Nginx intercepta requisições de entrada e delega para servidores internos via socket TCP. |
| **`daemon off;`** | Manter processo no Primeiro Plano | Impede que o Nginx vá para segundo plano, mantendo o PID 1 do contêiner ativo. |

---

## 3. Estrutura de Pastas do Projeto

```txt
ambientejs/
├── DOCKER_ENVIRONMENT_GUIDE.md
├── docker-compose.yml
├── backend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       └── index.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── public/
        └── index.html
```

---

## 4. Todos os Arquivos do Projeto

### 4.1. Raiz: `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: node_backend
    restart: always
    depends_on:
      - db
    environment:
      PORT: 3000
      DATABASE_URL: "postgresql://devuser:devpassword@db:5432/appdb?schema=public"
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    container_name: nginx_frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
    volumes:
      - ./frontend/public:/usr/share/nginx/html

volumes:
  postgres_data:
```

---

### 4.2. Backend: `backend/package.json`

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@prisma/client": "^5.19.1",
    "cors": "^2.8.5",
    "express": "^4.21.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4",
    "prisma": "^5.19.1"
  }
}
```

---

### 4.3. Backend: `backend/src/index.js`

```javascript
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend está rodando!',
    timestamp: new Date().toISOString()
  });
});

// Listar todos os itens
app.get('/api/items', async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar um novo item
app.post('/api/items', async (req, res) => {
  try {
    const { title } = req.body;
    const newItem = await prisma.item.create({
      data: { title: title || 'Item de teste' }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
```

---

### 4.4. Backend: `backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Item {
  id        Int      @id @default(autoincrement())
  title     String
  createdAt DateTime @default(now())
}
```

---

### 4.5. Backend: `backend/Dockerfile` e `backend/.dockerignore`

**`backend/.dockerignore`:**
```text
node_modules
npm-debug.log
.env
```

**`backend/Dockerfile`:**
```dockerfile
FROM node:20-alpine

# Instala a biblioteca OpenSSL (necessária para os motores nativos do Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

### 4.6. Frontend: `frontend/public/index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ambiente Fullstack Docker</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-5">
    <h1 class="mb-4 text-center">Cadastro de Itens (Docker + Nginx + Node + Postgres)</h1>
    
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <form id="itemForm" class="d-flex gap-2">
          <input type="text" id="itemTitle" class="form-control" placeholder="Digite o título do item..." required>
          <button type="submit" class="btn btn-primary">Adicionar</button>
        </form>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white fw-bold">Itens Cadastrados</div>
      <ul id="itemList" class="list-group list-group-flush">
        <li class="list-group-item text-muted">Carregando itens...</li>
      </ul>
    </div>
  </div>

  <script>
    const API_URL = '/api/items';

    async function loadItems() {
      try {
        const res = await fetch(API_URL);
        const items = await res.json();
        const list = document.getElementById('itemList');
        list.innerHTML = '';

        if (items.length === 0) {
          list.innerHTML = '<li class="list-group-item text-muted">Nenhum item cadastrado.</li>';
          return;
        }

        items.forEach(item => {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-center';
          li.innerHTML = `
            <span>${item.title}</span>
            <small class="text-muted">${new Date(item.createdAt).toLocaleString()}</small>
          `;
          list.appendChild(li);
        });
      } catch (err) {
        console.error(err);
        document.getElementById('itemList').innerHTML = '<li class="list-group-item text-danger">Erro ao carregar itens.</li>';
      }
    }

    document.getElementById('itemForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('itemTitle');
      const title = titleInput.value.trim();

      if (!title) return;

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      titleInput.value = '';
      loadItems();
    });

    loadItems();
  </script>
</body>
</html>
```

---

### 4.7. Frontend: `frontend/nginx.conf` e `frontend/Dockerfile`

**`frontend/nginx.conf`:**
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**`frontend/Dockerfile`:**
```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 5. Troubleshooting / Estudo de Caso de Erro

### Erro do Prisma no Alpine Linux (`SyntaxError: Unexpected token 'E'...`)
* **Sintoma:** Ao tentar rodar `npx prisma migrate dev`, ocorreu um erro de parsing de JSON.
* **Causa Raiz:** O Prisma utiliza binários nativos em C++/Rust que buscam dinamicamente pela biblioteca de criptografia `libssl.so` (OpenSSL). A imagem `node:20-alpine` não vem com OpenSSL por padrão. O *dynamic linker* falhou e emitiu uma mensagem de texto puro no stdout, corrompendo o protocolo IPC do Prisma.
* **Solução:** Adição de `RUN apk add --no-cache openssl` no `Dockerfile` do backend.

---

## 6. Comandos para Iniciar e Gerenciar o Ambiente

```bash
# 1. Compilar e subir os serviços em segundo plano:
docker compose up -d --build

# 2. Executar migrações do banco via Prisma:
docker compose exec backend npx prisma migrate dev --name init

# 3. Monitorar os logs de todos os serviços:
docker compose logs -f

# 4. Verificar status dos contêineres:
docker compose ps

# 5. Parar o ambiente preservando os dados:
docker compose stop

# 6. Destruir os contêineres preservando os dados do banco:
docker compose down

# 7. Reset total (destrói contêineres e o volume persistente do banco):
docker compose down -v
```
