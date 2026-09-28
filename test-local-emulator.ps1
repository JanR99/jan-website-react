# test-local-emulator.ps1
# Verifies that the LOCAL backend talks to the Datastore emulator and not to the real database.
#
# How it works:
#   1. Registers a random test user against the local backend and logs in.
#   2. Tries to log in with the same credentials against the REAL API.
#      If that login fails, the user only exists locally -> the emulator is used.
#      If it succeeds, the local backend wrote to the real Datastore -> FAIL.
#
# Prerequisite: run .\start-dev.ps1 in another terminal first.
# The only request sent to the real API is one login attempt with random credentials (read-only).

param(
    [string]$LocalUrl    = "http://localhost:8080",
    [string]$RemoteUrl   = "https://api.jan-website.de",
    [string]$EmulatorUrl = "http://localhost:8081"
)

$ErrorActionPreference = "Stop"
$script:failed = $false

function Write-Ok($message)   { Write-Host "  [PASS] $message" -ForegroundColor Green }
function Write-Fail($message) { Write-Host "  [FAIL] $message" -ForegroundColor Red; $script:failed = $true }
function Write-Warn($message) { Write-Host "  [WARN] $message" -ForegroundColor Yellow }

# Sends a request and returns the HTTP status (0 = no connection) and the response body.
function Invoke-Api {
    param([string]$Method, [string]$Uri, $Body = $null)

    $params = @{ Uri = $Uri; Method = $Method; UseBasicParsing = $true }
    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json
        $params.ContentType = "application/json; charset=utf-8"
        # Send UTF-8 bytes explicitly, Windows PowerShell 5.1 would otherwise use ISO-8859-1
        $params.Body = [System.Text.Encoding]::UTF8.GetBytes($json)
    }

    try {
        $response = Invoke-WebRequest @params
        return @{ Status = [int]$response.StatusCode; Content = $response.Content }
    }
    catch {
        $status = 0
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        return @{ Status = $status; Content = "" }
    }
}

# Random credentials, so nothing is hardcoded and repeated runs never collide
$suffix   = [guid]::NewGuid().ToString("N").Substring(0, 12)
$email    = "emutest-$suffix@example.com"
$password = [guid]::NewGuid().ToString("N")

Write-Host ""
Write-Host "Test user: $email" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: infrastructure is reachable ---
Write-Host "Step 1: Is everything running?" -ForegroundColor Cyan

$emulator = Invoke-Api -Method Get -Uri $EmulatorUrl
if ($emulator.Status -eq 200) { Write-Ok "Datastore emulator answers on $EmulatorUrl" }
else { Write-Fail "Datastore emulator not reachable on $EmulatorUrl - start it with .\start-dev.ps1" }

$local = Invoke-Api -Method Get -Uri "$LocalUrl/v3/api-docs"
if ($local.Status -eq 200) { Write-Ok "Local backend answers on $LocalUrl" }
else { Write-Fail "Local backend not reachable on $LocalUrl - start it with .\start-dev.ps1" }

if ($script:failed) {
    Write-Host ""
    Write-Host "Aborting: start the local environment first." -ForegroundColor Red
    exit 1
}

# --- Step 2: register locally ---
Write-Host ""
Write-Host "Step 2: Register the test user LOCALLY" -ForegroundColor Cyan

$register = Invoke-Api -Method Post -Uri "$LocalUrl/api/users/register" -Body @{
    email     = $email
    password  = $password
    firstname = "Emulator"
    lastname  = "Test"
}
if ($register.Status -eq 200) { Write-Ok "Registered locally (HTTP 200)" }
else { Write-Fail "Local registration failed (HTTP $($register.Status))" }

# --- Step 3: login locally ---
Write-Host ""
Write-Host "Step 3: Log in LOCALLY" -ForegroundColor Cyan

$localLogin = Invoke-Api -Method Post -Uri "$LocalUrl/api/users/login" -Body @{ email = $email; password = $password }
if ($localLogin.Status -eq 200 -and $localLogin.Content -match '"token"') { Write-Ok "Local login returned a token" }
else { Write-Fail "Local login failed (HTTP $($localLogin.Status))" }

# --- Step 4: the same credentials must NOT work against the real API ---
Write-Host ""
Write-Host "Step 4: Try the same credentials against the REAL API" -ForegroundColor Cyan

$remoteLogin = Invoke-Api -Method Post -Uri "$RemoteUrl/api/users/login" -Body @{ email = $email; password = $password }
if ($remoteLogin.Status -eq 200) {
    Write-Fail "The user EXISTS in the real database - the local backend is NOT using the emulator!"
}
elseif ($remoteLogin.Status -in 400, 401, 403, 404) {
    Write-Ok "Real API rejected the login (HTTP $($remoteLogin.Status)) - the user only exists locally"
}
elseif ($remoteLogin.Status -eq 0) {
    Write-Warn "Real API not reachable, the test is inconclusive. Check $RemoteUrl"
}
else {
    Write-Warn "Real API answered with unexpected HTTP $($remoteLogin.Status), the test is inconclusive"
}

# --- Summary ---
Write-Host ""
if ($script:failed) {
    Write-Host "RESULT: FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "RESULT: OK - local writes go to the emulator." -ForegroundColor Green
Write-Host "The emulator keeps data in memory only, so the test user disappears on the next restart."