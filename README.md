## Stage 0: Postgres in Docker

To start the standalone PostgreSQL database container locally:

```bash
docker run --name taskdb -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=tasks -p 5432:5432 -v taskdata:/var/lib/postgresql/data -d postgres:16-alpine
```

Then copy the environment template and start the API:

```bash
cp .env.example .env
npm start
```
