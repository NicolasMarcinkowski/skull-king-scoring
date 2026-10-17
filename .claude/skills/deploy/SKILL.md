---
name: deploy
description: Statut et diagnostic du déploiement CI/CD (GitHub Actions, GHCR, NAS, nginx)
---

# Deploy

Pipeline : push sur `main` → GitHub Actions → image Docker sur GHCR → SSH NAS → `docker compose pull && up -d`.

## Architecture de Déploiement

| Élément | Valeur |
|---------|--------|
| Workflow | `.github/workflows/deploy.yml` |
| Image | `ghcr.io/nicolasmarcinkowski/skull-king-scoring:latest` |
| Serveur | nginx:alpine servant l'export statique (`nginx.conf`) |
| NAS | dossier `/volume1/docker/skull-king-scoring/` (docker-compose.yaml local) |
| Port NAS | **3011** → 80 (conteneur) |
| Secrets GitHub | `NAS_HOST`, `NAS_USERNAME`, `NAS_PASSWORD`, `NAS_PORT` |

Le `docker-compose.prod.yaml` du repo est un modèle ; le fichier actif est celui du NAS.

## Vérifier le statut du dernier déploiement

```bash
curl -s "https://api.github.com/repos/NicolasMarcinkowski/skull-king-scoring/actions/runs?per_page=3" \
  | python3 -c "import json,sys; [print(r['status'], r.get('conclusion'), r['head_sha'][:7], r['html_url']) for r in json.load(sys.stdin)['workflow_runs']]"
```

## Diagnostic si le site ne répond pas

1. **Workflow échoué ?** → voir commande ci-dessus, puis les logs sur GitHub Actions
2. **Image buildée mais pull impossible ?** → vérifier que le package GHCR est public
   ou que le NAS est loggé sur ghcr.io
3. **Conteneur down ?** → en SSH sur le NAS :
   ```bash
   cd /volume1/docker/skull-king-scoring
   docker compose ps
   docker compose logs --tail 50
   docker compose pull && docker compose up -d
   ```
4. **Test local du site** : `curl -I http://<IP_NAS>:3011/`

## Test de l'image en local

```bash
docker build -t skull-king-test .
docker run -d --rm -p 3011:80 --name sk-test skull-king-test
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3011/
docker stop sk-test
```

## Changer le port d'exposition

Modifier `ports:` dans le docker-compose.yaml **sur le NAS** (pas celui du repo),
puis `docker compose up -d`.
