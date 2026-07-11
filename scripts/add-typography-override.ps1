$repoRoot = Split-Path $PSScriptRoot -Parent
$sectionsDir = Join-Path $repoRoot 'sections'
$checkboxBlock = @'
    {
      "type": "checkbox",
      "id": "typography_override",
      "label": "Override theme typography for this section",
      "default": false
    },
'@

$updated = 0
Get-ChildItem $sectionsDir -Filter '*.liquid' | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  if ($content -notmatch 'h1_font_family' -or $content -match 'typography_override') { return }

  $newContent = $content

  if ($newContent -match '"content": "Font and size for this section') {
    $newContent = $newContent -replace '("content": "Font and size for this section[^"]*"\s*\}\s*,)', "`$1`r`n$checkboxBlock"
  }
  elseif ($newContent -match '"content": "By default this section uses Theme settings') {
    $newContent = $newContent -replace '("content": "By default this section uses Theme settings[^"]*"\s*\}\s*,)', "`$1`r`n$checkboxBlock"
  }
  elseif ($newContent -match '"content": "Typography"') {
    $newContent = $newContent -replace '("content": "Typography"\s*\}\s*,)\s*(\{\s*\r?\n\s*"type": "select")', "`$1`r`n$checkboxBlock`r`n    `$2"
  }

  if ($newContent -ne $content) {
    [System.IO.File]::WriteAllText($_.FullName, $newContent)
    $updated++
  }
}

Write-Output "Added typography_override to $updated sections"
