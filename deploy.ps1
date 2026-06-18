[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 部署配置
$ServerIP     = "192.168.0.78"
$User         = "root"
$RemoteWebDir = "/www/wwwroot/design"
$BuildCommand = "pnpm build"
$DistPath     = "dist"

# 🎨 日志函数
function Log($msg, $color = "White") {
  $time = (Get-Date).ToString("HH:mm:ss")
  Write-Host "[$time] $msg" -ForegroundColor $color
}

try {
  # 1️⃣ 构建项目
  Push-Location $PSScriptRoot
  Log "🚀 执行构建命令：$BuildCommand" "Cyan"

  Invoke-Expression $BuildCommand
  if ($LASTEXITCODE -ne 0) {
    throw "❌ 构建失败，请检查输出日志"
  }
  Pop-Location

  # 2️⃣ 检查构建结果
  if (-not (Test-Path $DistPath)) {
    throw "❌ 构建成功但未生成 dist 目录"
  }

  # 3️⃣ 上传构建产物
  $remotePath = $RemoteWebDir
  Log "📦 开始上传 → ${User}@${ServerIP}:${remotePath}" "Yellow"

  # 创建远程目录
  $sshMkdir = "ssh ${User}@${ServerIP} `"mkdir -p $remotePath`""
  Invoke-Expression $sshMkdir

  # 使用 scp 上传
  $scpCommand = "scp -r `"$DistPath/*`" ${User}@${ServerIP}:`"$remotePath/`""
  Log "→ $scpCommand" "DarkGray"
  Invoke-Expression $scpCommand

  if ($LASTEXITCODE -ne 0) {
    throw "❌ 上传失败"
  }

  Log "✅ 部署完成：已上传到 $remotePath" "Green"

} catch {
  Log $_ "Red"
  exit 1
}
