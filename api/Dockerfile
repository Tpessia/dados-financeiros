# Build

FROM node:20.12.2-bullseye AS build

ARG NODE_OPTIONS

WORKDIR /app

COPY dist* ./dist
COPY package*.json .
RUN if [ ! -d "./dist" ]; then npm install; fi

COPY *.* ./
COPY src ./src
RUN ls -la .

RUN if [ ! -d "./dist" ]; then npm run build; fi

# Run

FROM node:20.12.2-bullseye AS run

ARG ENV=dev
ENV ENV=${ENV}
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

USER appuser

COPY --from=build /app/dist /app/dist
COPY .env.${ENV} .

# RUN mkdir -p /app
# RUN chown -R appuser:appuser /app

RUN mkdir -p /tmp/dados-financeiros
RUN chown -R appuser:appuser /tmp/dados-financeiros

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
