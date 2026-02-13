<#
.SYNOPSIS
    Verifies that protected routes redirect or return 401/403 when accessed without authentication.

.DESCRIPTION
    Tests (with configurable BaseUrl):
    1. GET /dashboard (no session cookie) -> expect 302 or 307 redirect to / or /auth/login
    2. GET /admin or /admin/dashboard/overview (no session) -> expect 302/307 redirect
    3. GET /api/admin/stats (no auth) -> expect 403 or 401
    4. GET /api/user/data (no auth) -> expect 401 or 403

    Uses -MaximumRedirection 0 to capture redirect responses without following.

.PARAMETER BaseUrl
    Base URL (e.g. http://localhost:3000). Can be set via $env:BASE_URL

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/security-routes.ps1
    powershell -ExecutionPolicy Bypass -File scripts/security-routes.ps1 -BaseUrl "https://fabiole.com"
    $env:BASE_URL = "http://localhost:3000"; .\scripts\security-routes.ps1
#>

param(
    [string]$BaseUrl = $env:BASE_URL
)

if (-not $BaseUrl) {
    $BaseUrl = "http://localhost:3000"
}

$BaseUrl = $BaseUrl.TrimEnd('/')

$allOk = $true

function Test-Route {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Description,
        [int[]]$ExpectedStatusCodes,
        [switch]$AllowRedirect
    )
    $uri = "$BaseUrl$Path"
    try {
        $params = @{
            Uri             = $uri
            Method          = $Method
            UseBasicParsing = $true
            TimeoutSec      = 10
            ErrorAction     = 'Stop'
        }
        if (-not $AllowRedirect) {
            $params['MaximumRedirection'] = 0
        }
        $response = Invoke-WebRequest @params
        $status = $response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        } else {
            Write-Warning "$Description : Request failed - $_"
            return $false
        }
    }
    if ($status -in $ExpectedStatusCodes) {
        Write-Host "OK $Description -> $status"
        return $true
    }
    Write-Warning "$Description : expected one of $($ExpectedStatusCodes -join ','), got $status"
    return $false
}

# 1. /dashboard without cookie -> redirect
if (-not (Test-Route -Method Get -Path "/dashboard" -Description "GET /dashboard (no cookie)" -ExpectedStatusCodes @(302, 307))) {
    $allOk = $false
}

# 2. /admin without cookie -> redirect
if (-not (Test-Route -Method Get -Path "/admin" -Description "GET /admin (no cookie)" -ExpectedStatusCodes @(302, 307))) {
    $allOk = $false
}

# 3. /api/admin/stats without auth -> 401 or 403
try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/api/admin/stats" -Method Get -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0 -ErrorAction Stop
    $status = $r.StatusCode
} catch {
    $status = [int]$_.Exception.Response.StatusCode
}
if ($status -in @(401, 403)) {
    Write-Host "OK GET /api/admin/stats (no auth) -> $status"
} else {
    Write-Warning "GET /api/admin/stats (no auth): expected 401 or 403, got $status"
    $allOk = $false
}

# 4. /api/user/data without auth -> 401 or 403
try {
    $r = Invoke-WebRequest -Uri "$BaseUrl/api/user/data" -Method Get -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0 -ErrorAction Stop
    $status = $r.StatusCode
} catch {
    $status = [int]$_.Exception.Response.StatusCode
}
if ($status -in @(401, 403)) {
    Write-Host "OK GET /api/user/data (no auth) -> $status"
} else {
    Write-Warning "GET /api/user/data (no auth): expected 401 or 403, got $status"
    $allOk = $false
}

if ($allOk) {
    Write-Host "All route protection checks passed."
    exit 0
}
exit 1
