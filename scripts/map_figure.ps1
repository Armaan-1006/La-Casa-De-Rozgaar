Add-Type -AssemblyName System.Drawing

function Map-Figure($path, $name) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "=== Mapping $name ($w x $h) ==="
    
    # Let's inspect rows from y = 100 to y = 1300 every 100 pixels
    for ($y = 100; $y -lt $h; $y += 150) {
        $minX = -1; $maxX = -1
        $maxL = 0
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $lum = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
            if ($lum -gt $maxL) { $maxL = $lum }
            # If color differs significantly from bg (e.g. red tint or brightness or darkness)
            # In Rio, the figure has red rim or body
        }
        Write-Host "Row y=$($y): max lum = $($maxL)"
    }
    $bmp.Dispose()
}

Map-Figure 'c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_exchange_shadow.jpg' 'Rio Exchange'
Map-Figure 'c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_exchange_shadow.jpg' 'Professor Exchange'
