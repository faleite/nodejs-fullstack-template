# 1. Imagem base: Linux Alpine com Node.js 20
FROM node:20-alpine

# 2. Instala a biblioteca OpenSSL (necessária para as bibliotecas nativas do Prisma)
RUN apk add --no-cache openssl

# 3. Diretório de trabalho dentro do contêiner
WORKDIR /app

# 4. Copia apenas os manifestos de dependências
COPY package*.json ./

# 5. Instala as dependências dentro do contêiner
RUN npm install

# 6. Copia a pasta do Prisma e gera o cliente JavaScript do Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# 7. Copia todo o restante do código-fonte
COPY . .

# 8. Documenta a porta da aplicação
EXPOSE 3000

# 9. Comando de inicialização
CMD ["npm", "run", "dev"]
