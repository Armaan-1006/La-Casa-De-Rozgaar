Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap("c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_exchange_shadow.jpg")
$w = $bmp.Width
$h = $bmp.Height

$r0 = 12.5
$g0 = 11.0
$b0 = 12.0

$bgMaxDist = 0
for ($y = 0; $y -lt 100; $y += 5) {
    for ($x = 0; $x -lt $w; $x += 10) {
        $p = $bmp.GetPixel($x, $y)
        $d = [Math]::Sqrt(($p.R - $r0)*($p.R - $r0) + ($p.G - $g0)*($p.G - $g0) + ($p.B - $b0)*($p.B - $b0))
        if ($d -gt $bgMaxDist) { $bgMaxDist = $d }
    }
}
Write-Host "Max dist in top 100 rows (pure background): $bgMaxDist"

# Check dist inside suit (e.g. x=600, y=500)
$pSuit = $bmp.GetPixel(600, 500)
$dSuit = [Math]::Sqrt(($pSuit.R - $r0)*($pSuit.R - $r0) + ($pSuit.G - $g0)*($pSuit.G - $g0) + ($pSuit.B - $b0)*($pSuit.B - $b0))
Write-Host "Dist inside suit (x=600, y=500): $dSuit"

# Check dist on rim (e.g. x=704, y=500)
$pRim = $bmp.GetPixel(704, 500)
$dRim = [Math]::Sqrt(($pRim.R - $r0)*($pRim.R - $r0) + ($pRim.G - $g0)*($pRim.G - $g0) + ($pRim.B - $b0)*($pRim.B - $b0))
Write-Host "Dist on rim (x=704, y=500): $dRim"

# Check dist on letter (x=192, y=750)
$pLetter = $bmp.GetPixel(192, 750)
$dLetter = [Math]::Sqrt(($pLetter.R - $r0)*($pLetter.R - $r0) + ($pLetter.G - $g0)*($pLetter.G - $g0) + ($pLetter.B - $b0)*($pLetter.B - $b0))
Write-Host "Dist on offer letter (x=192, y=750): $dLetter"

$bmp.Dispose()
