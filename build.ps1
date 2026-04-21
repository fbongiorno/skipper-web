$jsonPath = "build\destinations.json"
$destTemplatePath = "build\template-destination.html"
$hubTemplatePath = "build\template-hub.html"
$outDir = "destinations"
$assetsDir = "assets"

# Ensure output directories exist
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir | Out-Null }

$destinations = Get-Content $jsonPath | ConvertFrom-Json
$destTemplate = Get-Content $destTemplatePath -Raw
$hubTemplate = Get-Content $hubTemplatePath -Raw

$gridHtml = "<div class=`"destination-grid`">`n"

foreach ($dest in $destinations) {
    Write-Host "Building destination: $($dest.name)"
    
    # 1. Build individual destination page
    $pageHtml = $destTemplate -replace "\{\{DESTINATION_NAME\}\}", $dest.name
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_REGION\}\}", $dest.region
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_DESC\}\}", $dest.desc
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_ID\}\}", $dest.id
    
    # New Extended Content Fields
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_UNSPLASH\}\}", $dest.unsplash
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_BESTTIME\}\}", $dest.best_time
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_COST\}\}", $dest.cost
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_VISIT\}\}", $dest.dest_visit
    $pageHtml = $pageHtml -replace "\{\{DESTINATION_TRAVEL\}\}", $dest.travel
    
    # Magazine Articles
    if ($null -eq $dest.article_1 -or $dest.article_1 -eq "") { $dest.article_1 = "Navigate through sheltered anchorages, discover isolated coves, and dine at pristine waterfront establishments. Cruising this region offers the ultimate freedom to explore at your own tailored pace." }
    if ($null -eq $dest.article_2 -or $dest.article_2 -eq "") { $dest.article_2 = "Enjoy endless summer days with steady breezes. The climate here is consistently celebrated by superyacht captains as one of the most reliable and comfortable regions in the world for an extended luxury charter." }
    if ($null -eq $dest.article_3 -or $dest.article_3 -eq "") { $dest.article_3 = "Immerse yourself in world-class culinary traditions, centuries of unique regional maritime history, and vibrant nightlife that draws discerning guests from all corners of the globe." }

    $pageHtml = $pageHtml -replace "\{\{ARTICLE_1\}\}", $dest.article_1
    $pageHtml = $pageHtml -replace "\{\{ARTICLE_2\}\}", $dest.article_2
    $pageHtml = $pageHtml -replace "\{\{ARTICLE_3\}\}", $dest.article_3
    
    $outPath = Join-Path $outDir "$($dest.id).html"
    Set-Content -Path $outPath -Value $pageHtml

    # 2. Add to hub grid
    # For now we use hero-bg_wide.png as default if image doesn't exist. The onerror in the html handles broken images, 
    # but in the hub we just use a placeholder or check if asset exists. We'll use a clean layout.
    $card = @"
    <a href="destinations/$($dest.id).html" class="destination-card">
        <img src="assets/$($dest.id).png" class="dc-img" alt="$($dest.name)" onerror="this.src='hero-bg_wide.png';">
        <div class="dc-content">
            <span>$($dest.region)</span>
            <h3>$($dest.name)</h3>
        </div>
    </a>
"@
    $gridHtml += $card + "`n"
}

$gridHtml += "</div>"

# 3. Build Hub page
Write-Host "Building hub page destinations.html"
$finalHub = $hubTemplate -replace "<!-- DESTINATIONS_GRID -->", $gridHtml
Set-Content -Path "destinations.html" -Value $finalHub

Write-Host "Build Complete!"
