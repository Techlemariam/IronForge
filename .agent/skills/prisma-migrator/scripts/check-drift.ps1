# Check for database drift
Log-Factory "Checking for Database Drift..."
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --exit-code
if ($LASTEXITCODE -eq 2) {
    Log-Factory "Drift detected! Schema and database are out of sync." "ERROR"
    exit 2
}
Log-Factory "No drift detected. Database is in sync." "SUCCESS"
