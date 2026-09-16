# User Guide

### Ambiente de Desenvolvimento Web 
*(Docker + Nginx + Node.js + Prisma + PostgreSQL)*

> [!NOTE] 
> Template base para desenvolvimento de aplicações web modernas conteinerizadas.

---

## 🚀 Como Executar

### 1. Iniciar o ambiente
```bash
docker compose up -d --build
```
Acesse a aplicação no seu navegador em: **`http://localhost`**

---

## 🗄️ Trabalhando com o Banco de Dados (Prisma ORM)

O projeto já vem com um modelo inicial de exemplo (`User`) configurado em `backend/prisma/schema.prisma`.

### Como adicionar ou alterar tabelas:
1. Abra o arquivo `backend/prisma/schema.prisma` e adicione/modifique seus modelos (ex: `model Produto`, `model Cliente`, etc.).
2. Execute o comando de migração para atualizar o banco PostgreSQL e gerar o cliente JavaScript do Prisma:
   ```bash
   docker compose exec backend npx prisma migrate dev --name nome_da_migracao
   ```

### Como resetar o banco em desenvolvimento (limpeza completa):
Se quiser apagar todas as tabelas e dados em ambiente de desenvolvimento para reiniciar do zero:
```bash
docker compose exec backend npx prisma migrate reset
```

---

## 🛠️ Comandos de Manutenção

### Visualizar Logs
- **Todos os serviços:** `docker compose logs -f`
- **Apenas Backend:** `docker compose logs -f backend`
- **Apenas Frontend (Nginx):** `docker compose logs -f frontend`

### Parar o Ambiente
- **Parar os contêineres:** `docker compose stop`
- **Remover os contêineres:** `docker compose down`
- **Resetar tudo (incluindo o volume persistente do banco):** `docker compose down -v`

---
