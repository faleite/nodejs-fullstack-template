# 1. Imagem base: Nginx rodando em Alpine Linux ultraleve
FROM nginx:alpine

# 2. Sobrescreve a configuração padrão do Nginx com a nossa
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copia os arquivos HTML/JS estáticos para a pasta pública do Nginx
COPY public /usr/share/nginx/html

# 4. Documenta que o Nginx escuta na porta 80
EXPOSE 80

# 5. O Nginx inicia em primeiro plano (daemon off) para manter o contêiner rodando (PID 1)
CMD ["nginx", "-g", "daemon off;"]
