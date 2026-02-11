# Setup-NightlyTask.ps1
# Run this script to register the Task Scheduler job.

$TaskName = "Antigravity-NightShift"
$Workspace = "c:\Users\alexa\Workspaces\IronForge"
$Launcher = Join-Path $Workspace "scripts\workflow-launcher.ps1"
$Time = "02:00" # 2 AM

$Action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-ExecutionPolicy Bypass -File `"$Launcher`" -Workflow night-shift" `
  -WorkingDirectory $Workspace

$Trigger = New-ScheduledTaskTrigger -Daily -At $Time

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Force

Write-Host "✅ Task '$TaskName' registered to run daily at $Time" -ForegroundColor Green
Write-Host "📍 Workspace: $Workspace"
Write-Host "🚀 Running: /$Workflow"
