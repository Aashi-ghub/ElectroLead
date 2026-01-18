# Setup Test Database Script
# This script helps set up the test database connection

Write-Host "=== VoltSupply Test Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path .env) {
    Write-Host "✓ Found .env file" -ForegroundColor Green
    
    # Try to extract DATABASE_URL
    $envContent = Get-Content .env -Raw
    if ($envContent -match 'DATABASE_URL\s*=\s*(.+)') {
        $dbUrl = $matches[1].Trim()
        Write-Host "✓ Found DATABASE_URL in .env" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your current DATABASE_URL:" -ForegroundColor Yellow
        Write-Host $dbUrl -ForegroundColor Gray
        Write-Host ""
        
        # Extract database name and create test database name
        if ($dbUrl -match '/([^/]+)$') {
            $dbName = $matches[1]
            $testDbName = $dbName + "_test"
            $testDbUrl = $dbUrl -replace "/$dbName$", "/$testDbName"
            
            Write-Host "Suggested TEST_DATABASE_URL:" -ForegroundColor Yellow
            Write-Host $testDbUrl -ForegroundColor Gray
            Write-Host ""
            
            # Update .env.test
            if (Test-Path .env.test) {
                $testEnvContent = Get-Content .env.test -Raw
                if ($testEnvContent -notmatch 'TEST_DATABASE_URL') {
                    Add-Content .env.test "`nTEST_DATABASE_URL=$testDbUrl"
                    Write-Host "✓ Added TEST_DATABASE_URL to .env.test" -ForegroundColor Green
                } else {
                    Write-Host "! TEST_DATABASE_URL already exists in .env.test" -ForegroundColor Yellow
                    Write-Host "  Please update it manually with:" -ForegroundColor Yellow
                    Write-Host "  TEST_DATABASE_URL=$testDbUrl" -ForegroundColor Gray
                }
            } else {
                @"
TEST_DATABASE_URL=$testDbUrl
JWT_SECRET=test-jwt-secret-key-change-in-production
JWT_EXPIRY=7d
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
NODE_ENV=test
"@ | Out-File -FilePath .env.test -Encoding utf8
                Write-Host "✓ Created .env.test with TEST_DATABASE_URL" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "! Could not find DATABASE_URL in .env" -ForegroundColor Yellow
        Write-Host "  Please add it manually to .env.test:" -ForegroundColor Yellow
        Write-Host "  TEST_DATABASE_URL=postgresql://username:password@host:port/database_test" -ForegroundColor Gray
    }
} else {
    Write-Host "! No .env file found" -ForegroundColor Yellow
    Write-Host "  Please create .env.test manually with:" -ForegroundColor Yellow
    Write-Host "  TEST_DATABASE_URL=postgresql://username:password@host:port/database_test" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Make sure the test database exists in PostgreSQL" -ForegroundColor White
Write-Host "2. Update TEST_DATABASE_URL in .env.test if needed" -ForegroundColor White
Write-Host "3. Run: npm test" -ForegroundColor White
Write-Host ""



