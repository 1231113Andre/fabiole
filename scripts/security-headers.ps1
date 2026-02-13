<#
.SYNOPSIS
    Checks that security headers are present and have expected values on the target URL.

.DESCRIPTION
    Sends a GET request to the given BaseUrl and validates:
    - X-Frame-Options
    - X-Content-Type-Options
    - Content-Security-Policy
    - Referrer-Policy
    - Permissions-Policy
    In production (when -Production is set), also requires Strict-Transport-Security.

.PARAMETER BaseUrl
    Base URL to test (e.g. http://localhost:3000 or https://fabiole.com).
    Can also be set via environment: $env:BASE_URL

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/security-headers.ps1
    powershell -ExecutionPolicy Bypass -File scripts/security-headers.ps1 -BaseUrl "https://staging.example.com"
    $env:BASE_URL = "http://localhost:3000"; .\scripts\security-headers.ps1
#>

param(
    [string]$BaseUrl = $env:BASE_URL
)

if (-not $BaseUrl) {
    $BaseUrl = "http://localhost:3000"
}

# Trim trailing slash
$BaseUrl = $BaseUrl.TrimEnd('/')

$isProduction = $BaseUrl -match '^https://' -and $BaseUrl -notmatch 'localhost|127\.0\.0\.1'

$requiredHeaders = @(
    @{ Name = 'X-Frame-Options';       ValidValues = @('DENY', 'SAMEORIGIN') },
    @{ Name = 'X-Content-Type-Options'; ValidValues = @('nosniff') },
    @{ Name = 'Content-Security-Policy'; ValidValues = $null },  # any non-empty
    @{ Name = 'Referrer-Policy';        ValidValues = $null },
    @{ Name = 'Permissions-Policy';     ValidValues = $null }
)

if ($isProduction) {
    $requiredHeaders += @{ Name = 'Strict-Transport-Security'; ValidValues = $null }
}

$allOk = $true

try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method Get -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
} catch {
    Write-Warning "Request failed: $_"
    exit 1
}

# Case-insensitive header lookup (HTTP headers may be any case)
$headerMap = @{}
foreach ($key in $response.Headers.Keys) {
    $headerMap[$key.ToLowerInvariant()] = $response.Headers[$key]
}

foreach ($h in $requiredHeaders) {
    $name = $h.Name
    $value = $headerMap[$name.ToLowerInvariant()]
    if ($null -eq $value -or [string]::IsNullOrWhiteSpace($value)) {
        Write-Warning "Missing or empty header: $name"
        $allOk = $false
        continue
    }
    $validValues = $h.ValidValues
    if ($null -ne $validValues -and $validValues.Count -gt 0) {
        $match = $false
        foreach ($v in $validValues) {
            if ($value -eq $v) { $match = $true; break }
        }
        if (-not $match) {
            Write-Warning "Unexpected value for $name : '$value' (expected one of: $($validValues -join ', '))"
            $allOk = $false
        }
    }
}

if ($allOk) {
    Write-Host "All required security headers present for $BaseUrl"
    exit 0
}
exit 1
