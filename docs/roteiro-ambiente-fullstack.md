### Roteiro Proposto de Construção

Para construirmos uma base sólida sem sobrecarga cognitiva, dividiremos a montagem em **5 etapas lógicas**:

1. **Etapa 1: Estrutura de Pastas e Fundação**
   - Criação da árvore de diretórios do projeto para separar responsabilidades (frontend, backend e infraestrutura).
   - *Conceito em C/SO:* Como organizar o layout de pastas de um projeto (análogo a separar `src/`, `include/` e `build/`).

2. **Etapa 2: Banco de Dados Isolado (PostgreSQL)**
   - Configuração do serviço PostgreSQL no Docker Compose com persistência de dados.
   - *Conceito em C/SO:* Volumes como pontos de montagem (`mount`) e o ciclo de vida do processo do SGBD isolado em seu próprio *namespace*.
   - Teste de conexão e inspeção via terminal.

3. **Etapa 3: Backend Mínimo (Node.js + Express + Prisma ORM)**
   - Inicialização do ambiente Node, definição do `Dockerfile` do backend e integração inicial com o banco via Prisma.
   - *Conceito em C/SO:* O runtime Node como um processo executando um *event loop*, e o ORM como uma camada de abstração sobre conexões TCP e *sockets*.
   - Criação de um endpoint `/api/health` para validação.

4. **Etapa 4: Servidor Web e Proxy Reverso (Nginx + Frontend Mínimo)**
   - Criação de uma página HTML/JS estática simples.
   - Configuração do Nginx para servir esses arquivos estáticos e atuar como *Reverse Proxy* encaminhando requisições `/api` para o backend.
   - *Conceito em C/SO:* O Nginx como um gerenciador de *sockets* de entrada e redirecionador de tráfego de rede interna.

5. **Etapa 5: Orquestração Completa e Rede Interna (Docker Compose Integrado)**
   - União de todas as peças em uma rede interna compartilhada (*bridge network*).
   - Validação ponta a ponta: requisição do navegador → Nginx → Backend → Banco de Dados.

---

Quando estiver pronto, me avise para darmos o **Passo 1: criação da estrutura de pastas e organização inicial**.
