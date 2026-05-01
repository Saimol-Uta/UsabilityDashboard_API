param(
    [string]$Branch = 'prueba_segundo_parcial_Travez',
    [string]$Remote = 'origin'
)

$Dates = @(
    '2026-05-01T09:00:00',
    '2026-05-03T13:30:00',
    '2026-05-06T18:45:00',
    '2026-05-10T08:20:00',
    '2026-05-15T11:10:00'
)

$Messages = @(
    'chore(api): inicializar API y bootstrapping',
    'feat(domain): añadir entidades y modelos del dominio',
    'feat(app): servicios, DTOs y validadores',
    'chore(infra): persistencia e infra',
    'feat(ui/docs): frontend, wireframes y documentación HCI'
)

$Groups = @(
    'UsabilityDashboard_API/Program.cs UsabilityDashboard_API/*.csproj UsabilityDashboard_API/Controllers/ UsabilityDashboard_API/Properties/',
    'Domain/ Common/ Entities/ Interfaces/',
    'Application/ DTOs/ Services/ Mappings/ Validators/ Application.csproj',
    'Infrastructure/ Persistence/ Migrations/',
    'frontend_beta/ HCI-PruebaFinal/ README.md LICENSE.txt exam_extracted.txt IngresoDeDatos.sql'
)

# Ensure git available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git not found in PATH"
    exit 1
}

Write-Host "Switching to branch $Branch (create if needed)..."
if (git rev-parse --verify $Branch 2>$null) {
    git checkout $Branch
} else {
    git checkout -b $Branch
}

for ($i = 0; $i -lt 5; $i++) {
    Write-Host "\n---\nPreparing commit $($i+1)"
    $paths = $Groups[$i] -split ' '
    foreach ($p in $paths) {
        try { git add $p 2>$null } catch { }
    }

    # Check staged changes
    $staged = git diff --staged --name-only
    if (-not $staged) {
        Write-Host "No staged changes for commit $($i+1), skipping."
        continue
    }

    $env:GIT_AUTHOR_DATE = $Dates[$i]
    $env:GIT_COMMITTER_DATE = $Dates[$i]

    git commit -m "$($Messages[$i])"
    Write-Host "Committed: $($Messages[$i]) at $($Dates[$i])"
}

Write-Host "Pushing branch to remote $Remote/$Branch..."
git push -u $Remote $Branch

Write-Host 'Done. Review commits with: git log --oneline --decorate '
