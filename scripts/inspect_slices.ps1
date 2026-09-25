Add-Type -AssemblyName System.Drawing

function Inspect-Slices($path, $name) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "=== Slices for $name ($w x $h) ==="
    
    # Check y = h/3 (chest/shoulders) and y = h/2 (torso/hands)
    $y1 = [int]($h * 0.35)
    $y2 = [int]($h * 0.50)
    
    Write-Host "--- Row at y=$y1 ---"
    $rowStr = ""
    for ($x = 0; $x -lt $w; $x += 16) {
        $p = $bmp.GetPixel($x, $y1)
        $m = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
        if ($m -gt 0) {
            $rowStr += "[$($x): $($m)] "
        }
    }
    Write-Host $rowStr

    Write-Host "--- Row at y=$y2 ---"
    $rowStr2 = ""
    for ($x = 0; $x -lt $w; $x += 16) {
        $p = $bmp.GetPixel($x, $y2)
        $m = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
        if ($m -gt 0) {
            $rowStr2 += "[$($x): $($m)] "
        }
    }
    Write-Host $rowStr2
    $bmp.Dispose()
}

Inspect-Slices 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\prof_offer_clean_sil_1790347695272.jpg' 'ProfClean'
Inspect-Slices 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\rio_file_clean_sil_1790347666979.jpg' 'RioClean'
