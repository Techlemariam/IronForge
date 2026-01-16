# link-issue-to-project.Tests.ps1
# Pester unit tests for the Issue linker script

Describe "link-issue-to-project.ps1" {
    
    BeforeAll {
        $ScriptPath = Join-Path $PSScriptRoot "..\link-issue-to-project.ps1"
        $ConfigPath = Join-Path $PSScriptRoot "..\..\config\github-project.json"
    }
    
    Context "Config Loading" {
        It "Should find config file" {
            Test-Path $ConfigPath | Should Be $true
        }
        
        It "Should have all required field IDs" {
            $config = Get-Content $ConfigPath | ConvertFrom-Json
            $config.fields.status.id | Should Not BeNullOrEmpty
            $config.fields.priority.id | Should Not BeNullOrEmpty
            $config.fields.effort.id | Should Not BeNullOrEmpty
            $config.fields.domain.id | Should Not BeNullOrEmpty
            $config.fields.roi.id | Should Not BeNullOrEmpty
        }
    }
    
    Context "Parameter Validation" {
        It "Should require IssueNumber parameter" {
            $params = (Get-Command $ScriptPath).Parameters
            ($params.Keys -contains "IssueNumber") | Should Be $true
            $mandatory = $params["IssueNumber"].Attributes | Where-Object { $_ -is [Parameter] }
            $mandatory.Mandatory | Should Be $true
        }
        
        It "Should validate Priority values" {
            $params = (Get-Command $ScriptPath).Parameters
            $validateSet = $params["Priority"].Attributes | Where-Object { $_ -is [ValidateSet] }
            ($validateSet.ValidValues -contains "critical") | Should Be $true
            ($validateSet.ValidValues -contains "high") | Should Be $true
            ($validateSet.ValidValues -contains "medium") | Should Be $true
            ($validateSet.ValidValues -contains "low") | Should Be $true
        }
        
        It "Should validate Domain values" {
            $params = (Get-Command $ScriptPath).Parameters
            $validateSet = $params["Domain"].Attributes | Where-Object { $_ -is [ValidateSet] }
            ($validateSet.ValidValues -contains "game") | Should Be $true
            ($validateSet.ValidValues -contains "infra") | Should Be $true
            ($validateSet.ValidValues -contains "bio") | Should Be $true
        }
        
        It "Should validate Effort values" {
            $params = (Get-Command $ScriptPath).Parameters
            $validateSet = $params["Effort"].Attributes | Where-Object { $_ -is [ValidateSet] }
            ($validateSet.ValidValues -contains "S") | Should Be $true
            ($validateSet.ValidValues -contains "M") | Should Be $true
            ($validateSet.ValidValues -contains "L") | Should Be $true
            ($validateSet.ValidValues -contains "XL") | Should Be $true
        }
        
        It "Should have ROI as numeric type" {
            $params = (Get-Command $ScriptPath).Parameters
            $params["ROI"].ParameterType.Name | Should Be "Double"
        }
        
        It "Should have Auto switch parameter" {
            $params = (Get-Command $ScriptPath).Parameters
            ($params.Keys -contains "Auto") | Should Be $true
            $params["Auto"].SwitchParameter | Should Be $true
        }
    }
    
    Context "Status Options Mapping" {
        It "Should map status names to IDs correctly" {
            $config = Get-Content $ConfigPath | ConvertFrom-Json
            $config.fields.status.options.backlog | Should Match "^[a-f0-9]{8}$"
            $config.fields.status.options.in_progress | Should Match "^[a-f0-9]{8}$"
            $config.fields.status.options.done | Should Match "^[a-f0-9]{8}$"
        }
    }
}
