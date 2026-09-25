Add-Type -AssemblyName System.Drawing

function Inspect-Slices($path, $name) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "=== Slices for $name ($w x $h) ==="
    
    $y1 = [int]($h * 0.35)
    $y2 = [int]($h * 0.50)
    
    Write-Host "--- Row at y=$y1 ---"
    $rowStr = ""
    for ($x = 0; $x -lt $w; $x += 16) {
        $p = $bmp.GetPixel($x, $y1)
        $m = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
        $rowStr += "[$($x): $($m)] "
    }
    Write-Host $rowStr
    $bmp.Dispose()
}

Inspect-Slices 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347117458.jpg' 'Rio Reference'
Inspect-Slices 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347135769.jpg' 'Professor Reference'
