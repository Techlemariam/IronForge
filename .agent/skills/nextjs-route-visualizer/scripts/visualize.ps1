# Visualize Next.js routes
Log-Factory "Visualizing Route Territory..."
# Placeholder for actual visualization logic (e.g. tree command or custom tool)
Get-ChildItem -Recurse src/app -Filter "page.tsx" | Select-Object -ExpandProperty FullName | ForEach-Object {
    $Relative = $_ -replace [regex]::Escape($PWD.Path), ""
    Write-Host "📍 [ROUTE] $Relative"
}
