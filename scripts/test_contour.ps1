Add-Type -AssemblyName System.Drawing

function Test-Contour($path, $thresh) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "Analyzing $path ($w x $h) with threshold $thresh"
    
    # Check if the border of the image is completely clean (<= thresh)
    $borderLeaks = 0
    for ($x = 0; $x -lt $w; $x++) {
        $pTop = $bmp.GetPixel($x, 0)
        $pBot = $bmp.GetPixel($x, $h - 1)
        if ([Math]::Max($pTop.R, [Math]::Max($pTop.G, $pTop.B)) -gt $thresh) { $borderLeaks++ }
        if ([Math]::Max($pBot.R, [Math]::Max($pBot.G, $pBot.B)) -gt $thresh) { $borderLeaks++ }
    }
    for ($y = 0; $y -lt $h; $y++) {
        $pLeft = $bmp.GetPixel(0, $y)
        $pRight = $bmp.GetPixel($w - 1, $y)
        if ([Math]::Max($pLeft.R, [Math]::Max($pLeft.G, $pLeft.B)) -gt $thresh) { $borderLeaks++ }
        if ([Math]::Max($pRight.R, [Math]::Max($pRight.G, $pRight.B)) -gt $thresh) { $borderLeaks++ }
    }
    Write-Host "Border leaks at threshold $($thresh): $($borderLeaks)"
    $bmp.Dispose()
}

Test-Contour 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\prof_offer_clean_sil_1790347695272.jpg' 4
Test-Contour 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\rio_file_clean_sil_1790347666979.jpg' 4
