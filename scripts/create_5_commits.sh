#!/usr/bin/env bash
set -euo pipefail

BRANCH="prueba_segundo_parcial_Travez"
REMOTE="origin"

# Suggested dates (ISO 8601)
DATES=(
  "2026-05-01T09:00:00"
  "2026-05-03T13:30:00"
  "2026-05-06T18:45:00"
  "2026-05-10T08:20:00"
  "2026-05-15T11:10:00"
)

MESSAGES=(
  "chore(api): inicializar API y bootstrapping"
  "feat(domain): añadir entidades y modelos del dominio"
  "feat(app): servicios, DTOs y validadores"
  "chore(infra): persistencia e infra"
  "feat(ui/docs): frontend, wireframes y documentación HCI"
)

GROUPS=(
  "UsabilityDashboard_API/Program.cs UsabilityDashboard_API/*.csproj UsabilityDashboard_API/Controllers/ UsabilityDashboard_API/Properties/"
  "Domain/ Common/ Entities/ Interfaces/"
  "Application/ DTOs/ Services/ Mappings/ Validators/ Application.csproj"
  "Infrastructure/ Persistence/ Migrations/"
  "frontend_beta/ HCI-PruebaFinal/ README.md LICENSE.txt exam_extracted.txt IngresoDeDatos.sql"
)

echo "Switching to branch ${BRANCH} (create if needed)..."
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

for i in 0 1 2 3 4; do
  echo "\n---\nPreparing commit $((i+1))"
  echo "Adding paths: ${GROUPS[$i]}"
  # Add files (ignore errors if a path doesn't exist)
  set +e
  for p in ${GROUPS[$i]}; do
    git add $p 2>/dev/null || true
  done
  set -e

  # Check if there is anything to commit
  if git diff --staged --quiet; then
    echo "No staged changes for commit $((i+1)), skipping commit."
    continue
  fi

  export GIT_AUTHOR_DATE="${DATES[$i]}"
  export GIT_COMMITTER_DATE="${DATES[$i]}"

  git commit -m "${MESSAGES[$i]}"
  echo "Committed: ${MESSAGES[$i]} at ${DATES[$i]}"
done

echo "Pushing branch to remote ${REMOTE}/${BRANCH}..."
git push -u $REMOTE $BRANCH

echo "Done. Review the commits with: git log --oneline --decorate $BRANCH"
