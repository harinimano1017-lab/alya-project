param([switch]$Elevated)

if (-not $Elevated) {
    Write-Host "Requesting Administrator privileges..."
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Elevated"
    exit
}

Write-Host "Restarting PostgreSQL Service..."
Restart-Service -Name "postgresql-x64-18" -ErrorAction Stop
Write-Host "Service Restarted."

Write-Host "Resetting postgres password to 'admin1234'..."
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d template1 -c "ALTER USER postgres WITH PASSWORD 'admin1234';"

Write-Host "Reverting pg_hba.conf to require password..."
$pgHba = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
(Get-Content $pgHba) -replace '127.0.0.1/32            trust', '127.0.0.1/32            scram-sha-256' -replace '::1/128                 trust', '::1/128                 scram-sha-256' | Set-Content $pgHba

Write-Host "Restarting PostgreSQL Service again..."
Restart-Service -Name "postgresql-x64-18"
Write-Host "Done! The PostgreSQL password is now explicitly set to 'admin1234'."
Read-Host "Press Enter to exit"
