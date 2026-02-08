# Git Guard Tests (Pester)
# Run: Invoke-Pester -Path .agent/skills/git-guard/tests/

Describe "Git Guard Skill" {
    BeforeAll {
        $scriptPath = Join-Path $PSScriptRoot "..\scripts\verify-branch.ps1"
    }

    Context "When on main branch" {
        It "Should exit with code 1" {
            # Mock git to return 'main'
            Mock git { return "main" } -ParameterFilter { $args[0] -eq "rev-parse" }
            
            $result = & $scriptPath 2>&1
            $LASTEXITCODE | Should -Be 1
        }
    }

    Context "When on feature branch" {
        It "Should exit with code 0" {
            # This test requires actually being on a feature branch
            # or more sophisticated mocking
            $currentBranch = git rev-parse --abbrev-ref HEAD
            if ($currentBranch -ne "main") {
                & $scriptPath
                $LASTEXITCODE | Should -Be 0
            }
            else {
                Set-ItResult -Skipped -Because "Currently on main branch"
            }
        }
    }
}
