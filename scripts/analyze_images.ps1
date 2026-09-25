Add-Type -AssemblyName System.Drawing

function Analyze-Image($path, $name) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "=== $name ($w x $h) ==="
    
    # Check max brightness across the image
    $maxVal = 0
    $maxPoint = ""
    for ($y = 0; $y -lt $h; $y += 20) {
        for ($x = 0; $x -lt $w; $x += 20) {
            $p = $bmp.GetPixel($x, $y)
            $lum = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
            if ($lum -gt $maxVal) {
                $maxVal = $lum
                $maxPoint = "($x,$y) R=$($p.R), G=$($p.G), B=$($p.B)"
            }
        }
    }
    Write-Host "Max brightness: $maxVal at $maxPoint"

    # Check top/left/right/bottom border brightness
    $borderMax = 0
    for ($x = 0; $x -lt $w; $x += 10) {
        $pTop = $bmp.GetPixel($x, 0)
        $pBot = $bmp.GetPixel($x, $h - 1)
        $borderMax = [Math]::Max($borderMax, [Math]::Max($pTop.R, [Math]::Max($pTop.G, $pTop.B)))
        $borderMax = [Math]::Max($borderMax, [Math]::Max($pBot.R, [Math]::Max($pBot.G, $pBot.B)))
    }
    for ($y = 0; $y -lt $h; $y += 10) {
        $pLeft = $bmp.GetPixel(0, $y)
        $pRight = $bmp.GetPixel($w - 1, $y)
        $borderMax = [Math]::Max($borderMax, [Math]::Max($pLeft.R, [Math]::Max($pLeft.G, $pLeft.B)))
        $borderMax = [Math]::Max($borderMax, [Math]::Max($pRight.R, [Math]::Max($pRight.G, $pRight.B)))
    }
    Write-Host "Max border brightness: $borderMax"
    $bmp.Dispose()
}

Analyze-Image 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347117458.jpg' 'Rio Reference'
Analyze-Image 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347135769.jpg' 'Professor Reference'
