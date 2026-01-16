# link-pr-to-project.Tests.ps1
# Pester unit tests for the PR linker script

Describe "link-pr-to-project.ps1" {

    BeforeAll {
        $ScriptPath = Join-Path $PSScriptRoot "..\link-pr-to-project.ps1"
        $ConfigPath = Join-Path $PSScriptRoot "..\..\config\github-project.json"
    }
    
    Context "Config Loading" {
        It "Should find config file" {
            Test-Path $ConfigPath | Should Be $true
        }
        
        It "Should have valid JSON" {
            { Get-Content $ConfigPath | ConvertFrom-Json } | Should Not Throw
        }
        
        It "Should have required fields" {
            $config = Get-Content $ConfigPath | ConvertFrom-Json
            $config.projectId | Should Not BeNullOrEmpty
            $config.projectNumber | Should BeGreaterThan 0
            $config.owner | Should Not BeNullOrEmpty
            $config.fields.status | Should Not BeNullOrEmpty
        }
        
        It "Should have status options" {
            $config = Get-Content $ConfigPath | ConvertFrom-Json
            $config.fields.status.options.backlog | Should Not BeNullOrEmpty
            $config.fields.status.options.in_progress | Should Not BeNullOrEmpty
            $config.fields.status.options.in_review | Should Not BeNullOrEmpty
            $config.fields.status.options.done | Should Not BeNullOrEmpty
        }
    }
    
    Context "WhatIf Mode" {
        It "Should support -WhatIf parameter" {
            $params = (Get-Command $ScriptPath).Parameters
            ($params.Keys -contains "WhatIf") | Should Be $true
        }
    }
    
    Context "Parameter Validation" {
        It "Should have optional PRNumber parameter" {
            $params = (Get-Command $ScriptPath).Parameters
            ($params.Keys -contains "PRNumber") | Should Be $true
            ($params["PRNumber"].Attributes.Mandatory -contains $false) | Should Be $true
        }
        
        It "Should validate Status parameter" {
            $params = (Get-Command $ScriptPath).Parameters
            ($params.Keys -contains "Status") | Should Be $true
            $validateSet = $params["Status"].Attributes | Where-Object { $_ -is [ValidateSet] }
            ($validateSet.ValidValues -contains "in_review") | Should Be $true
            ($validateSet.ValidValues -contains "done") | Should Be $true
        }
    }
}
