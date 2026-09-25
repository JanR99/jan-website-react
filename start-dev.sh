# start-dev.sh
# start Firestore-Emulator (Datastore-Mode) and then Spring-Boot-App.

$ErrorActionPreference = "Stop"

# --- Config ---
$EmulatorPort = "8081"
$ProjectId    = "jan-website"
$BackendDir   = "backend"

Write-Host "Starte Firestore-Emulator (Datastore-Modus) auf Port $EmulatorPort ..." -ForegroundColor Cyan

# start Emulator in own window
$emulatorProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "gcloud emulators firestore start --database-mode=datastore-mode --host-port=localhost:$EmulatorPort"
) -PassThru

Write-Host "Warte kurz, bis der Emulator hochgefahren ist ..." -ForegroundColor Cyan
Start-Sleep -Seconds 6

# env-Variables
$env:DATASTORE_EMULATOR_HOST = "localhost:$EmulatorPort"
$env:GOOGLE_CLOUD_PROJECT    = $ProjectId

Write-Host "DATASTORE_EMULATOR_HOST = $env:DATASTORE_EMULATOR_HOST" -ForegroundColor Green
Write-Host "GOOGLE_CLOUD_PROJECT    = $env:GOOGLE_CLOUD_PROJECT" -ForegroundColor Green

# --- JDK 21 (Spring Boot 3.x only uses Java 21) ---
$AdoptiumRoot = "C:\Program Files\Eclipse Adoptium"
$Jdk21Dir = Get-ChildItem -Path $AdoptiumRoot -Directory -Filter "jdk-21*" -ErrorAction SilentlyContinue |
            Select-Object -First 1

if (-not $Jdk21Dir) {
    Write-Host "ERROR: No 'jdk-21*'-Folder under '$AdoptiumRoot' found." -ForegroundColor Red
    exit 1
}

$env:JAVA_HOME = $Jdk21Dir.FullName
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host "Start Spring-Boot-App in '$BackendDir' ..." -ForegroundColor Cyan
Push-Location $BackendDir
try {
    mvn spring-boot:run
}
finally {
    Pop-Location
}