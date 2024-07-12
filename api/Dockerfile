# Build

FROM node:20.12.2-bullseye AS build

ARG NODE_OPTIONS

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN ls -la .

RUN npm run build

# Run

FROM node:20.12.2-bullseye AS run

ARG ENV=dev
ENV NODE_ENV=${ENV}
ARG NODE_OPTIONS
ENV NODE_OPTIONS=${NODE_OPTIONS}

WORKDIR /app

RUN apt-get update
RUN apt-get install -y net-tools nano
RUN rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser
RUN useradd -r -g appuser -m -d /app -s /bin/bash --uid 2000 appuser

COPY package*.json .
RUN npm install --omit=dev

COPY --from=build /app/dist /app/dist
COPY .env.${ENV} .

RUN chown -R appuser:appuser /app

RUN ls -la .

USER appuser

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
