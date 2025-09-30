#Usar una imagen base oficial de Node.js
FROM node:18

#Establecer el directorio de trabajo en el contenedor
WORKDIR /app    

#Copiar los archivos de package.json e instalar las dependencias
COPY package*.json ./
RUN npm install

#Copiar el resto de los archivos de la aplicación
COPY . .

#Variables de entorno
ENV PORT=3000

#Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 3000

#Comando para iniciar la aplicación
CMD [ "npm", "start" ]