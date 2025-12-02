FROM node:22-alpine

WORKDIR /workspace

# Instalar dependencias del sistema
RUN apk update && apk add --no-cache git

# Instalar Ionic CLI y otras herramientas globalmente
RUN npm install -g @ionic/cli @capacitor/cli

# Instalar dependencias comunes para marketplace
RUN npm install -g tailwindcss

EXPOSE 8100

# Comando por defecto - usaremos override en docker-compose
CMD ["tail", "-f", "/dev/null"]