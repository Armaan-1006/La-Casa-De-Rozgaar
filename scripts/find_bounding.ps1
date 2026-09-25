Add-Type -AssemblyName System.Drawing

function Find-Silhouette($path) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    $minX = $w; $maxX = 0; $minY = $h; $maxY = 0;
    $count = 0
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            # if any channel > 3
            if ($p.R -gt 3 -or $p.G -gt 3 -or $p.B -gt 3) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
                $count++
            }
        }
    }
    Write-Host "File: $path"
    Write-Host "Non-black pixels (>3): $count. Bounding box: X=[$minX, $maxX], Y=[$minY, $maxY]"
    $bmp.Dispose()
}

Find-Silhouette 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\prof_offer_clean_sil_1790347695272.jpg'
Find-Silhouette 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\rio_file_clean_sil_1790347666979.jpg'
