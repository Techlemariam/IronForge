$ProjectNumber = 4
$Owner = "Techlemariam"
$TargetDateFieldId = "PVTF_lAHOAe3KCM4BMt-pzg786n8"

# Get items
echo "Fetching items..."
$itemsJson = gh project item-list $ProjectNumber --owner $Owner --format json --limit 100
$items = $itemsJson | ConvertFrom-Json | Select-Object -ExpandProperty items

foreach ($item in $items) {
    if ($item.milestone -and $item.milestone.dueOn) {
        $itemId = $item.id
        $dateStr = $item.milestone.dueOn
        # Parse and format date (YYYY-MM-DD)
        $date = [DateTime]::Parse($dateStr).ToString("yyyy-MM-dd")
        
        echo "Updating Item: $($item.title)"
        echo "  Milestone: $($item.milestone.title)"
        echo "  Due: $date"
        
        gh project item-edit --project-id PVT_kwHOAe3KCM4BMt-p --id $itemId --field-id $TargetDateFieldId --date $date
    }
}
