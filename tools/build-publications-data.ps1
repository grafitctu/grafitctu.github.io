param(
    [string]$OutputPath = (Join-Path (Get-Location) 'publications\publications-data.js')
)

$ErrorActionPreference = 'Stop'

function ConvertFrom-HtmlText {
    param([string]$Value)

    $withoutTags = $Value -replace '<[^>]+>', ' '
    $decoded = [System.Net.WebUtility]::HtmlDecode($withoutTags)
    return ($decoded -replace '\s+', ' ').Trim()
}

function Get-Category {
    param([string]$TypeCs, [string]$TypeEn)

    $type = "$TypeCs $TypeEn".ToLowerInvariant()
    if ($type -match 'článek|article|journal') {
        return 'journal'
    }
    if ($type -match 'kapitola|chapter') {
        return 'chapter'
    }
    if ($type -match 'sborník|conference|proceedings') {
        return 'conference'
    }
    return 'other'
}

function New-Publication {
    param(
        [string]$Member,
        [string]$Year,
        [string]$TitleCs,
        [string]$TitleEn,
        [string]$MetaCs,
        [string]$MetaEn,
        [string]$TypeCs,
        [string]$TypeEn,
        [string]$Url,
        [string]$Source
    )

    return [pscustomobject][ordered]@{
        member = $Member
        year = $Year
        title = [ordered]@{ cs = $TitleCs; en = $TitleEn }
        meta = [ordered]@{ cs = $MetaCs; en = $MetaEn }
        type = [ordered]@{ cs = $TypeCs; en = $TypeEn }
        category = Get-Category $TypeCs $TypeEn
        url = $Url
        source = $Source
    }
}

$members = [ordered]@{
    jch = [ordered]@{ name = 'Jiří Chludil'; url = '../members/jch/' }
    jk = [ordered]@{ name = 'Jiří Kubišta'; url = '../members/jk/' }
    jm = [ordered]@{ name = 'Jiří Melnikov'; url = '../members/jm/' }
    pp = [ordered]@{ name = 'Petr Pauš'; url = '../members/pp/' }
    rr = [ordered]@{ name = 'Radek Richtr'; url = '../members/rr/' }
    tn = [ordered]@{ name = 'Tomáš Nováček'; url = '../members/tn/' }
}

$records = @()

$memberDataRaw = Get-Content -LiteralPath 'members\member-records-data.js' -Raw -Encoding UTF8
$jsonStart = $memberDataRaw.IndexOf('{')
$jsonEnd = $memberDataRaw.LastIndexOf('};')
if ($jsonStart -lt 0 -or $jsonEnd -lt $jsonStart) {
    throw 'Cannot parse members/member-records-data.js.'
}
$memberData = $memberDataRaw.Substring($jsonStart, $jsonEnd - $jsonStart + 1) | ConvertFrom-Json

foreach ($member in @('jch', 'jk', 'jm', 'rr')) {
    foreach ($publication in @($memberData.$member.publications)) {
        $records += New-Publication `
            $member `
            $publication.year `
            $publication.title.cs `
            $publication.title.en `
            $publication.meta.cs `
            $publication.meta.en `
            $publication.type.cs `
            $publication.type.en `
            $publication.url `
            'member-catalogue'
    }
}

$petrHtml = Get-Content -LiteralPath 'members\pp\index.html' -Raw -Encoding UTF8
$petrStart = $petrHtml.IndexOf('<section class="profile-section" id="publikace"')
$petrEnd = $petrHtml.IndexOf('<section class="profile-section" id="diplomove-prace"')
if ($petrStart -lt 0 -or $petrEnd -le $petrStart) {
    throw 'Cannot find Petr Paus publication section.'
}
$petrSection = $petrHtml.Substring($petrStart, $petrEnd - $petrStart)
$petrPattern = '(?s)<a class="work-item" href="(?<url>[^"]+)".*?<span class="work-year">(?<year>\d{4}) · (?<type>[^<]+)</span>.*?<strong>(?<title>.*?)</strong><span>(?<meta>.*?)</span>.*?</a>'
$petrMatches = [regex]::Matches($petrSection, $petrPattern)
if ($petrMatches.Count -ne 30) {
    throw "Expected 30 Petr Paus publications, found $($petrMatches.Count)."
}

$petrTypeEn = @{
    'článek' = 'Journal article'
    'sborník' = 'Conference paper'
    'kapitola' = 'Book chapter'
    'publikace' = 'Publication'
}
foreach ($match in $petrMatches) {
    $typeCs = ConvertFrom-HtmlText $match.Groups['type'].Value
    $typeEn = if ($petrTypeEn.ContainsKey($typeCs)) { $petrTypeEn[$typeCs] } else { 'Publication' }
    $title = ConvertFrom-HtmlText $match.Groups['title'].Value
    $meta = ConvertFrom-HtmlText $match.Groups['meta'].Value
    $records += New-Publication `
        'pp' `
        $match.Groups['year'].Value `
        $title `
        $title `
        $meta `
        $meta `
        $typeCs `
        $typeEn `
        $match.Groups['url'].Value `
        'personal-bibliography'
}

$supplement = @(
    (New-Publication 'jk' '2024' 'Presentation of Historical Clothing Digital Replicas in Motion' 'Presentation of Historical Clothing Digital Replicas in Motion' 'Dvořák, T.; Kubišta, J.; Linhart, O.; Malý, I.; Sedláček, D.; Ubik, S. · IEEE Access 12, 13310–13326' 'Dvořák, T.; Kubišta, J.; Linhart, O.; Malý, I.; Sedláček, D.; Ubik, S. · IEEE Access 12, 13310–13326' 'Článek' 'Journal article' 'https://doi.org/10.1109/ACCESS.2024.3355049' 'publisher'),
    (New-Publication 'jk' '2024' 'Workflow for Creating Animated Digital Replicas of Historical Clothing' 'Workflow for Creating Animated Digital Replicas of Historical Clothing' 'Kubišta, J.; Linhart, O.; Sedláček, D.; Ubik, S. · IEEE Access 12, 83707–83718' 'Kubišta, J.; Linhart, O.; Sedláček, D.; Ubik, S. · IEEE Access 12, 83707–83718' 'Článek' 'Journal article' 'https://doi.org/10.1109/ACCESS.2024.3413674' 'publisher'),
    (New-Publication 'jk' '2022' 'Interactive 3D Models: Documenting and Presenting Restoration and Use of Heritage Objects' 'Interactive 3D Models: Documenting and Presenting Restoration and Use of Heritage Objects' 'Ubik, S.; Kubišta, J.; Dvořák, T. · Digital Applications in Archaeology and Cultural Heritage 27, e00246' 'Ubik, S.; Kubišta, J.; Dvořák, T. · Digital Applications in Archaeology and Cultural Heritage 27, e00246' 'Článek' 'Journal article' 'https://doi.org/10.1016/j.daach.2022.e00246' 'publisher'),
    (New-Publication 'jk' '2017' 'Interactive 3D Models of Collection Items for Education and Presentation Applications' 'Interactive 3D Models of Collection Items for Education and Presentation Applications' 'Ubik, S.; Kubišta, J. · EVA Berlin 2017, 148–152' 'Ubik, S.; Kubišta, J. · EVA Berlin 2017, 148–152' 'Stať ve sborníku' 'Conference paper' 'https://books.ub.uni-heidelberg.de/arthistoricum/catalog/view/443/656/83199' 'publisher'),
    (New-Publication 'tn' '2024' 'Precise Hand Tracking Using Multiple Optical Sensors' 'Precise Hand Tracking Using Multiple Optical Sensors' 'Nováček, T. · IEEE VRW 2024, 1144–1145' 'Nováček, T. · IEEE VRW 2024, 1144–1145' 'Stať ve sborníku' 'Proceedings paper' 'https://doi.org/10.1109/VRW62533.2024.00366' 'fit'),
    (New-Publication 'tn' '2023' 'Comparison of Touchless Interaction With One and Multiple Optical Sensors' 'Comparison of Touchless Interaction With One and Multiple Optical Sensors' 'Nováček, T.; Kondáč, R.; Jiřina, M. · ICAT-EGVE 2023, 95–104' 'Nováček, T.; Kondáč, R.; Jiřina, M. · ICAT-EGVE 2023, 95–104' 'Stať ve sborníku' 'Proceedings paper' 'https://doi.org/10.2312/egve.20231317' 'fit'),
    (New-Publication 'tn' '2021' 'Project MultiLeap: Fusing Data from Multiple Leap Motion Sensors' 'Project MultiLeap: Fusing Data from Multiple Leap Motion Sensors' 'Nováček, T.; Marty, Ch.; Jiřina, M. · 7th IEEE International Conference on Virtual Reality, 19–25' 'Nováček, T.; Marty, Ch.; Jiřina, M. · 7th IEEE International Conference on Virtual Reality, 19–25' 'Stať ve sborníku' 'Proceedings paper' 'https://doi.org/10.1109/ICVR51878.2021.9483819' 'fit'),
    (New-Publication 'tn' '2021' 'Project MultiLeap: Making Multiple Hand Tracking Sensors to Act Like One' 'Project MultiLeap: Making Multiple Hand Tracking Sensors to Act Like One' 'Nováček, T.; Jiřina, M. · IEEE AIVR 2021, 77–83' 'Nováček, T.; Jiřina, M. · IEEE AIVR 2021, 77–83' 'Stať ve sborníku' 'Proceedings paper' 'https://doi.org/10.1109/AIVR52153.2021.00021' 'fit'),
    (New-Publication 'tn' '2020' 'Overview of Controllers of User Interface for Virtual Reality' 'Overview of Controllers of User Interface for Virtual Reality' 'Nováček, T.; Jiřina, M. · PRESENCE: Virtual and Augmented Reality 29, 37–90' 'Nováček, T.; Jiřina, M. · PRESENCE: Virtual and Augmented Reality 29, 37–90' 'Článek' 'Journal article' 'https://doi.org/10.1162/pres_a_00356' 'fit')
)
$records += $supplement

$deduplicated = @{}
foreach ($record in $records) {
    $key = (($record.member + '|' + $record.year + '|' + $record.title.en) -replace '\s+', ' ').ToLowerInvariant()
    $deduplicated[$key] = $record
}

$sorted = @($deduplicated.Values | Sort-Object `
    @{ Expression = { [int]$_.year }; Descending = $true }, `
    @{ Expression = { $_.title.en }; Descending = $false })

if ($sorted.Count -ne 58) {
    throw "Expected 58 publications, found $($sorted.Count)."
}

$result = [ordered]@{
    updated = '2026-07-20'
    members = $members
    publications = $sorted
}

$json = $result | ConvertTo-Json -Depth 10 -Compress
$javascript = @"
/* Generated by tools/build-publications-data.ps1. Do not edit by hand. */
window.GRAFIT_PUBLICATIONS = $json;
"@

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutput
if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}
[System.IO.File]::WriteAllText($resolvedOutput, $javascript, [System.Text.UTF8Encoding]::new($false))
Write-Host "Wrote $resolvedOutput with $($sorted.Count) publications."
