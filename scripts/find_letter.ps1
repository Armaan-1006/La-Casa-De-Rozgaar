Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap("c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_exchange_shadow.jpg")
$w = $bmp.Width
$h = $bmp.Height

# Find where the offer letter is (it's held in hands extended leftward)
for ($y = 600; $y -lt 900; $y += 50) {
    Write-Host "--- Slice at y=$y ---"
    for ($x = 0; $x -lt $w; $x += 32) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 20 -or $p.R -lt 10) {
            Write-Host "x=$x : R=$($p.R) G=$($p.G) B=$($p.B)"
        }
    }
}

$bmp.Dispose()
