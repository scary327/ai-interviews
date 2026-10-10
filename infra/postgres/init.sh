#!/bin/sh
# Схема и пользователь на каждый сервис. В чужую схему доступа нет.
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-SQL
    CREATE USER $CORE_DB_USER WITH PASSWORD '$CORE_DB_PASSWORD';
    CREATE SCHEMA core AUTHORIZATION $CORE_DB_USER;
    ALTER ROLE $CORE_DB_USER SET search_path = core;

    CREATE USER $AI_DB_USER WITH PASSWORD '$AI_DB_PASSWORD';
    CREATE SCHEMA ai AUTHORIZATION $AI_DB_USER;
    ALTER ROLE $AI_DB_USER SET search_path = ai;

    REVOKE ALL ON SCHEMA public FROM PUBLIC;
SQL
