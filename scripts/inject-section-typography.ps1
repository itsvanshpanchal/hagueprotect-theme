$repoRoot = Split-Path $PSScriptRoot -Parent
$typographySchema = Get-Content (Join-Path $repoRoot 'config\section-typography-settings.json') -Raw
$renderLine = "  {% render 'section-typography-vars', section: section %}`r`n`r`n"
$sectionsDir = Join-Path $repoRoot 'sections'
$files = Get-ChildItem $sectionsDir -Filter '*.liquid' | Select-Object -ExpandProperty FullName -Unique
$updatedRender = 0
$updatedSchema = 0
$skipped = @()

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  $changed = $false

  if ($content -notmatch 'section-typography-vars') {
    if ($content -match '\{%- style -%\}') {
      $content = $content -replace '\{%- style -%\}', "{%- style -%}`r`n$renderLine"
      $changed = $true
      $updatedRender++
    } elseif ($content -match '\{% schema %\}') {
      $content = "{%- style -%}`r`n$renderLine{%- endstyle -%}`r`n`r`n" + $content
      $changed = $true
      $updatedRender++
    }
  }

  if ($content -notmatch 'h1_font_family') {
    if ($content -match '(?s)  \],\s*\r?\n\s*"blocks"') {
      $content = $content -replace '(?s)  \],(\s*\r?\n\s*"blocks")', ($typographySchema + "`r`n  ],`$1")
      $changed = $true
      $updatedSchema++
    } elseif ($content -match '(?s)  \],\s*\r?\n\s*"presets"') {
      $content = $content -replace '(?s)  \],(\s*\r?\n\s*"presets")', ($typographySchema + "`r`n  ],`$1")
      $changed = $true
      $updatedSchema++
    } elseif ($content -match '(?s)  \],\s*\r?\n\s*"max_blocks"') {
      $content = $content -replace '(?s)  \],(\s*\r?\n\s*"max_blocks")', ($typographySchema + "`r`n  ],`$1")
      $changed = $true
      $updatedSchema++
    } else {
      $skipped += (Split-Path $file -Leaf)
    }
  }

  if ($changed) {
    [System.IO.File]::WriteAllText($file, $content)
  }
}

Write-Output "Render updates: $updatedRender"
Write-Output "Schema updates: $updatedSchema"
if ($skipped.Count -gt 0) {
  Write-Output "Skipped schema: $($skipped -join ', ')"
}
