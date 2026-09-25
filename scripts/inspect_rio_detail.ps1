Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap("c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_exchange_shadow.jpg")
$w = $bmp.Width
$h = $bmp.Height

Write-Host "Rio Exchange: $w x $h"

# Slices across hair (y=250), chest/file (y=500), file folder (y=700), legs (y=1000)
$testYs = @(250, 500, 700, 1000)
foreach ($y in $testYs) {
    Write-Host "--- Slice at y=$y ---"
    for ($x = 0; $x -lt $w; $x += 32) {
        $p = $bmp.GetPixel($x, $y)
        Write-Host "x=$x : R=$($p.R) G=$($p.G) B=$($p.B)"
    }
}

$bmp.Dispose()
