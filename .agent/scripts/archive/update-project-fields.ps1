#!/usr/bin/env pwsh
# Bulk update GitHub Project fields for IronForge issues

$ProjectId = "PVT_kwHOAe3KCM4BMt-p"

# Field IDs from gh project field-list
$PriorityFieldId = "PVTSSF_lAHOAe3KCM4BMt-pzg77AGY"
$RoiFieldId = "PVTF_lAHOAe3KCM4BMt-pzg77AMw"
$EffortFieldId = "PVTSSF_lAHOAe3KCM4BMt-pzg77APU"
$DomainFieldId = "PVTSSF_lAHOAe3KCM4BMt-pzg77Bqw"
$StatusFieldId = "PVTSSF_lAHOAe3KCM4BMt-pzg76_fI"

# Priority options
$PriorityCritical = "c5fbed17"
$PriorityHigh = "fd1199fc"
$PriorityMedium = "6dcde45d"
$PriorityLow = "3e471d1e"

# Effort options
$EffortS = "8ebb9e75"
$EffortM = "a9c74091"
$EffortL = "d84ead2c"
$EffortXL = "c375a38a"

# Domain options
$DomainGame = "9afec929"
$DomainInfra = "8ac6d178"
$DomainBio = "49759843"
$DomainSocial = "3677609a"
$DomainCommerce = "ebbda65c"

# Status options
$StatusBacklog = "f75ad846"
$StatusInProgress = "47fc9ee4"
$StatusDone = "98236657"

# Item ID mappings (issue number -> item ID)
$Items = @{
    73 = "PVTI_lAHOAe3KCM4BMt-pzgjvtUc"
    74 = "PVTI_lAHOAe3KCM4BMt-pzgjvtVM"
    75 = "PVTI_lAHOAe3KCM4BMt-pzgjvtWE"
    76 = "PVTI_lAHOAe3KCM4BMt-pzgjvtW8"
    77 = "PVTI_lAHOAe3KCM4BMt-pzgjvtYU"
    78 = "PVTI_lAHOAe3KCM4BMt-pzgjvtZo"
    79 = "PVTI_lAHOAe3KCM4BMt-pzgjvtag"
    80 = "PVTI_lAHOAe3KCM4BMt-pzgjvtbI"
    81 = "PVTI_lAHOAe3KCM4BMt-pzgjvtcE"
    82 = "PVTI_lAHOAe3KCM4BMt-pzgjvtcc"
    83 = "PVTI_lAHOAe3KCM4BMt-pzgjvtc8"
    84 = "PVTI_lAHOAe3KCM4BMt-pzgjvtdQ"
    85 = "PVTI_lAHOAe3KCM4BMt-pzgjvtdo"
    86 = "PVTI_lAHOAe3KCM4BMt-pzgjvteQ"
    87 = "PVTI_lAHOAe3KCM4BMt-pzgjvtfo"
    88 = "PVTI_lAHOAe3KCM4BMt-pzgjvtgc"
}

# Issue metadata from roadmap.md
$IssueMetadata = @{
    73 = @{ Priority = $PriorityCritical; ROI = 5.0; Effort = $EffortS; Domain = $DomainInfra }
    74 = @{ Priority = $PriorityCritical; ROI = 5.0; Effort = $EffortS; Domain = $DomainInfra }
    75 = @{ Priority = $PriorityHigh; ROI = 4.6; Effort = $EffortL; Domain = $DomainGame }
    76 = @{ Priority = $PriorityHigh; ROI = 4.8; Effort = $EffortM; Domain = $DomainGame }
    77 = @{ Priority = $PriorityHigh; ROI = 4.0; Effort = $EffortM; Domain = $DomainGame }
    78 = @{ Priority = $PriorityHigh; ROI = 4.5; Effort = $EffortS; Domain = $DomainGame }
    79 = @{ Priority = $PriorityHigh; ROI = 4.3; Effort = $EffortL; Domain = $DomainGame }
    80 = @{ Priority = $PriorityMedium; ROI = 4.0; Effort = $EffortM; Domain = $DomainGame }
    81 = @{ Priority = $PriorityMedium; ROI = 4.2; Effort = $EffortM; Domain = $DomainGame }
    82 = @{ Priority = $PriorityMedium; ROI = 4.2; Effort = $EffortM; Domain = $DomainGame }
    83 = @{ Priority = $PriorityMedium; ROI = 4.0; Effort = $EffortM; Domain = $DomainCommerce }
    84 = @{ Priority = $PriorityHigh; ROI = 4.5; Effort = $EffortS; Domain = $DomainInfra }
    85 = @{ Priority = $PriorityHigh; ROI = 4.8; Effort = $EffortM; Domain = $DomainInfra }
    86 = @{ Priority = $PriorityMedium; ROI = 4.0; Effort = $EffortS; Domain = $DomainInfra }
    87 = @{ Priority = $PriorityMedium; ROI = 3.5; Effort = $EffortS; Domain = $DomainInfra }
    88 = @{ Priority = $PriorityHigh; ROI = 4.5; Effort = $EffortS; Domain = $DomainInfra }
}

function Update-ProjectField {
    param(
        [string]$ItemId,
        [string]$FieldId,
        [string]$Value,
        [string]$ValueType = "singleSelectOptionId"
    )
    
    $mutation = @"
mutation {
  updateProjectV2ItemFieldValue(
    input: {
      projectId: "$ProjectId"
      itemId: "$ItemId"
      fieldId: "$FieldId"
      value: { ${ValueType}: "$Value" }
    }
  ) {
    projectV2Item { id }
  }
}
"@
    
    $mutation | Out-File -FilePath ".agent/temp/mutation.graphql" -Encoding utf8
    gh api graphql -F query=@.agent/temp/mutation.graphql 2>&1
}

function Update-NumberField {
    param(
        [string]$ItemId,
        [string]$FieldId,
        [double]$Value
    )
    
    $mutation = @"
mutation {
  updateProjectV2ItemFieldValue(
    input: {
      projectId: "$ProjectId"
      itemId: "$ItemId"
      fieldId: "$FieldId"
      value: { number: $Value }
    }
  ) {
    projectV2Item { id }
  }
}
"@
    
    $mutation | Out-File -FilePath ".agent/temp/mutation.graphql" -Encoding utf8
    gh api graphql -F query=@.agent/temp/mutation.graphql 2>&1
}

Write-Host "🔄 Updating GitHub Project fields..." -ForegroundColor Cyan

foreach ($issueNum in $IssueMetadata.Keys | Sort-Object) {
    $itemId = $Items[$issueNum]
    $meta = $IssueMetadata[$issueNum]
    
    Write-Host "  Issue #$issueNum..." -NoNewline
    
    # Update Priority
    $result = Update-ProjectField -ItemId $itemId -FieldId $PriorityFieldId -Value $meta.Priority
    
    # Update ROI
    $result = Update-NumberField -ItemId $itemId -FieldId $RoiFieldId -Value $meta.ROI
    
    # Update Effort
    $result = Update-ProjectField -ItemId $itemId -FieldId $EffortFieldId -Value $meta.Effort
    
    # Update Domain
    $result = Update-ProjectField -ItemId $itemId -FieldId $DomainFieldId -Value $meta.Domain
    
    Write-Host " ✅" -ForegroundColor Green
}

Write-Host "`n✅ All fields updated!" -ForegroundColor Green
