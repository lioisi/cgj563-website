# Deploy script for CGJ563 website to Ferozo
# Usage: .\deploy.ps1

Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build successful!`n" -ForegroundColor Green

# FTP Configuration
$FTPServer = "a0150879.ferozo.com"
$User = "a0150879"
$Pass = "Mohabon563Pagina*"
$LocalPath = "$PSScriptRoot\dist"
$FTPPath = "/public_html/"

Write-Host "📤 Uploading to Ferozo..." -ForegroundColor Cyan

function Upload-FileToFTP {
    param(
        [string]$LocalFile,
        [string]$FTPFilePath
    )
    
    try {
        $FTPRequest = [System.Net.FtpWebRequest]::Create("ftp://$FTPServer$FTPFilePath")
        $FTPRequest.Credentials = New-Object System.Net.NetworkCredential($User, $Pass)
        $FTPRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $FTPRequest.UseBinary = $true
        $FTPRequest.KeepAlive = $true
        
        $FileStream = [System.IO.File]::OpenRead($LocalFile)
        $FTPRequest.ContentLength = $FileStream.Length
        
        $RequestStream = $FTPRequest.GetRequestStream()
        $FileStream.CopyTo($RequestStream)
        $RequestStream.Close()
        
        $Response = $FTPRequest.GetResponse()
        $Response.Close()
        return $true
    }
    catch {
        Write-Host "❌ Error uploading $([System.IO.Path]::GetFileName($LocalFile)): $_" -ForegroundColor Red
        return $false
    }
}

# Create directories first
$Dirs = Get-ChildItem -Path $LocalPath -Recurse -Directory
foreach ($Dir in $Dirs) {
    $RelPath = $Dir.FullName.Substring($LocalPath.Length).Replace("\", "/")
    $FTPDir = "ftp://$FTPServer$FTPPath$RelPath"
    try {
        $mkdirReq = [System.Net.FtpWebRequest]::Create($FTPDir)
        $mkdirReq.Credentials = New-Object System.Net.NetworkCredential($User, $Pass)
        $mkdirReq.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $mkdirReq.GetResponse().Close()
    }
    catch {
        # Directory may already exist
    }
}

# Upload all files
$Files = Get-ChildItem -Path $LocalPath -Recurse -File
$uploadedCount = 0
foreach ($File in $Files) {
    $RelPath = $File.FullName.Substring($LocalPath.Length).Replace("\", "/")
    $FTPFilePath = "$FTPPath$RelPath"
    
    if (Upload-FileToFTP -LocalFile $File.FullName -FTPFilePath $FTPFilePath) {
        $uploadedCount++
    }
}

# Push changes to GitHub
Write-Host "`n📚 Pushing to GitHub..." -ForegroundColor Cyan
git add -A
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>$null
git push origin main 2>$null

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "📊 Uploaded: $uploadedCount files`n" -ForegroundColor Green
Write-Host "📍 Live at: https://cgj563.com" -ForegroundColor Cyan
