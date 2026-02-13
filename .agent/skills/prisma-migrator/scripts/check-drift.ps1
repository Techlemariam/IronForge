# Check for database drift
Log-Factory "Checking for Database Drift..."
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --exit-code
$Code = $LASTEXITCODE

if ($Code -eq 2) {
    Log-Factory "Drift detected! Schema and database are out of sync." "ERROR"
    exit 2
}
elseif ($Code -ne 0) {
    Log-Factory "Error: Prisma migrate diff failed with exit code $Code. Check database connection." "ERROR"
    exit $Code
}
Log-Factory "No drift detected. Database is in sync." "SUCCESS"
}
elseif ($Code -ne 0) {
    Log-Factory "Error: Prisma migrate diff failed with exit code $Code. Check database connection." "ERROR"
    exit $Code
}
Log-Factory "No drift detected. Database is in sync." "SUCCESS"
