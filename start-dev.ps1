# start-dev.ps1
# start Firestore-Emulator (Datastore-Mode) and then Spring-Boot-App.

$ErrorActionPreference = "Stop"

# --- Config ---
$EmulatorPort = "8081"
$ProjectId    = "jan-website"
$BackendDir   = "backend"

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

# --- Start Firestore emulator (Datastore mode) in its own window ---
Write-Host "Starting Firestore emulator (Datastore mode) on port $EmulatorPort ..." -ForegroundColor Cyan

$emulatorProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "gcloud emulators firestore start --database-mode=datastore-mode --host-port=localhost:$EmulatorPort"
) -PassThru

Write-Host "Waiting for the emulator to start up ..." -ForegroundColor Cyan
Start-Sleep -Seconds 6

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
}