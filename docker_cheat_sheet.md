# Docker Cheat Sheet — Code Wave AI

## Image Details

| Field | Value |
|---|---|
| **Image** | `meherjaved440/code-wave-ai:latest` |
| **Registry** | Docker Hub (Private) |
| **Base** | `nginx:alpine` |
| **Port** | `80` |

---

## Build

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=your_supabase_url \
  --build-arg VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -t meherjaved440/code-wave-ai:latest .
```

## Run

```bash
docker run -d -p 3000:80 --name code-wave-ai meherjaved440/code-wave-ai:latest
```

Access at: http://localhost:3000

## Stop & Remove

```bash
docker stop code-wave-ai
docker rm code-wave-ai
```

## Push to Docker Hub

```bash
docker login -u meherjaved440
docker push meherjaved440/code-wave-ai:latest
```

## Pull from Docker Hub

```bash
docker login -u meherjaved440
docker pull meherjaved440/code-wave-ai:latest
```

## Tag a New Version

```bash
docker tag meherjaved440/code-wave-ai:latest meherjaved440/code-wave-ai:v1.0
docker push meherjaved440/code-wave-ai:v1.0
```

## View Logs

```bash
docker logs code-wave-ai
docker logs -f code-wave-ai   # follow live
```

## Shell Access

```bash
docker exec -it code-wave-ai sh
```

## Check Running Containers

```bash
docker ps
docker ps -a   # include stopped
```

## Remove Image

```bash
docker rmi meherjaved440/code-wave-ai:latest
```

## Clean Up Everything

```bash
docker system prune -a
```

---

## Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  code-wave-ai:
    image: meherjaved440/code-wave-ai:latest
    ports:
      - "3000:80"
    restart: unless-stopped
```

Run:

```bash
docker compose up -d
docker compose down
```
