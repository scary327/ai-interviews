COMPOSE = docker compose -f infra/docker-compose.yml --env-file .env

.PHONY: up down logs ps jwt-keys api-gen

up:            ## Поднять все сервисы
	$(COMPOSE) up -d --build

down:          ## Остановить
	$(COMPOSE) down

logs:          ## Логи всех сервисов
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

jwt-keys:      ## Сгенерировать пару ключей RS256 для core-api
	mkdir -p infra/secrets
	openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out infra/secrets/jwt_private.pem
	openssl rsa -in infra/secrets/jwt_private.pem -pubout -out infra/secrets/jwt_public.pem

api-gen:       ## Сгенерировать API-клиент фронта (хуки, типы, моки) из contracts/
	cd services/web && npm run api:gen
