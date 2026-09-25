Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap("c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_exchange_shadow.jpg")
$w = $bmp.Width
$h = $bmp.Height

Write-Host "Professor Exchange: $w x $h"

# Let's inspect a horizontal slice across the chest/arms/letter at y = 500
$y = 500
Write-Host "--- Slice at y=$y ---"
for ($x = 0; $x -lt $w; $x += 32) {
    $p = $bmp.GetPixel($x, $y)
    Write-Host "x=$x : R=$($p.R) G=$($p.G) B=$($p.B)"
}

# Let's inspect a horizontal slice across the face/glasses at y = 350
$y = 350
Write-Host "--- Slice at y=$y ---"
for ($x = 0; $x -lt $w; $x += 32) {
    $p = $bmp.GetPixel($x, $y)
    Write-Host "x=$x : R=$($p.R) G=$($p.G) B=$($p.B)"
}

$bmp.Dispose()
