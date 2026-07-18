# Wrapper around the Python trimmer (safer JSON handling than regex).
$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'trim-section-typography.py'
python $script
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python (Join-Path $PSScriptRoot 'validate-typography-schemas.py')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
