# start-dev.ps1
# start Firestore-Emulator (Datastore-Mode) and the Datastore UI in Docker and then Spring-Boot-App.

$ErrorActionPreference = "Stop"

# --- Config ---
$EmulatorPort    = "8081"
$DatastoreUiPort = "8083"   # 8080 is the backend, 8082 the emulator of the tests
$ProjectId       = "jan-website"
$BackendDir      = "backend"

$DockerNetwork        = "jan-website-dev"
$EmulatorContainer    = "jan-website-datastore"
$DatastoreUiContainer = "jan-website-datastore-ui"
$EmulatorImage        = "gcr.io/google.com/cloudsdktool/google-cloud-cli:emulators"
$DatastoreUiImage     = "ghcr.io/drehelis/gcp-emulator-ui:main"

function Remove-DevContainers {
    # via cmd, because PowerShell would turn Docker's stderr output into an error
    cmd /c "docker rm -f $EmulatorContainer $DatastoreUiContainer >nul 2>&1"
}

# --- Load .env file (if present) ---
$EnvFile = ".env"
if (Test-Path $EnvFile) {
    Write-Host "Loading environment variables from $EnvFile ..." -ForegroundColor Cyan
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        # Skip empty lines and comments
        if ($line -eq "" -or $line.StartsWith("#")) { return }

        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  $key set" -ForegroundColor DarkGray
        }
    }
} else {
    Write-Host "No .env file found ($EnvFile) - skipping. See .env.example." -ForegroundColor Yellow
}

# --- Docker: both containers share a network, so the UI reaches the emulator by its container name ---
cmd /c "docker info >nul 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Start Docker Desktop first." -ForegroundColor Red
    exit 1
}
# Remove containers left over from a previous run, otherwise their names and ports are still taken
Remove-DevContainers
cmd /c "docker network create $DockerNetwork >nul 2>&1"

# --- Start Firestore emulator (Datastore mode) as a Docker container in the background ---
# (the first start downloads the Docker images, which takes a while)
Write-Host "Starting Firestore emulator (Datastore mode) on port $EmulatorPort ..." -ForegroundColor Cyan

docker run -d --rm --name $EmulatorContainer --network $DockerNetwork -p "127.0.0.1:${EmulatorPort}:8081" `
    $EmulatorImage `
    gcloud emulators firestore start --database-mode=datastore-mode --host-port=0.0.0.0:8081 --quiet | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not start the emulator container." -ForegroundColor Red
    Remove-DevContainers
    exit 1
}

# --- Start the Datastore UI (gcp-emulator-ui) as a Docker container in the background ---
Write-Host "Starting Datastore UI on http://localhost:$DatastoreUiPort ..." -ForegroundColor Cyan

docker run -d --rm --name $DatastoreUiContainer --network $DockerNetwork -p "127.0.0.1:${DatastoreUiPort}:80" `
    -e "DATASTORE_EMULATOR_URL=${EmulatorContainer}:8081" `
    $DatastoreUiImage | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not start the Datastore UI container." -ForegroundColor Red
    Remove-DevContainers
    exit 1
}

Write-Host "Logs: Docker Desktop, or 'docker logs -f $EmulatorContainer' / 'docker logs -f $DatastoreUiContainer'" -ForegroundColor DarkGray

# Wait until the emulator answers instead of a fixed time
Write-Host "Waiting for the emulator to start up ..." -ForegroundColor Cyan
$emulatorReady = $false
$deadline = (Get-Date).AddMinutes(2)
while (-not $emulatorReady -and (Get-Date) -lt $deadline) {
    try {
        Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$EmulatorPort" -TimeoutSec 2 | Out-Null
        $emulatorReady = $true
    }
    catch {
        # any HTTP answer (even an error status) means the emulator is up
        if ($_.Exception.Response) { $emulatorReady = $true } else { Start-Sleep -Seconds 1 }
    }
}
if (-not $emulatorReady) {
    Write-Host "ERROR: The emulator did not start. Its log:" -ForegroundColor Red
    docker logs $EmulatorContainer
    Remove-DevContainers
    exit 1
}

# --- Env variables for the emulator connection ---
$env:DATASTORE_EMULATOR_HOST = "localhost:$EmulatorPort"
$env:GOOGLE_CLOUD_PROJECT    = $ProjectId

Write-Host "DATASTORE_EMULATOR_HOST = $env:DATASTORE_EMULATOR_HOST" -ForegroundColor Green
Write-Host "GOOGLE_CLOUD_PROJECT    = $env:GOOGLE_CLOUD_PROJECT" -ForegroundColor Green

# --- Use JDK 21 instead of the system JDK (Spring Boot 3.x needs JDK 21) ---
$AdoptiumRoot = "C:\Program Files\Eclipse Adoptium"
$Jdk21Dir = Get-ChildItem -Path $AdoptiumRoot -Directory -Filter "jdk-21*" -ErrorAction SilentlyContinue |
        Select-Object -First 1

if (-not $Jdk21Dir) {
    Write-Host "ERROR: No 'jdk-21*' folder found under '$AdoptiumRoot'. Is JDK 21 installed?" -ForegroundColor Red
    Remove-DevContainers
    exit 1
}

$env:JAVA_HOME = $Jdk21Dir.FullName
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green
& "$env:JAVA_HOME\bin\java.exe" -version

# --- Start the Spring Boot app ---
Write-Host "Starting Spring Boot app in '$BackendDir' ..." -ForegroundColor Cyan
Push-Location $BackendDir
try {
    mvn spring-boot:run
}
finally {
    Pop-Location
    # The containers run in the background, so remove them here (also on Ctrl+C)
    Write-Host "Stopping emulator and Datastore UI ..." -ForegroundColor Cyan
    Remove-DevContainers
}