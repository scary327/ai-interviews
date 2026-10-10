COMPOSE = docker compose -f infra/docker-compose.yml --env-file .env

.PHONY: up down logs ps jwt-keys gen-types

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

gen-types:     ## Сгенерировать TS-типы для фронта из contracts/
	cd services/web && npx openapi-typescript ../../contracts/core-api.yaml -o src/shared/api/generated/core.ts
	cd services/web && npx openapi-typescript ../../contracts/ai-service.yaml -o src/shared/api/generated/ai.ts
