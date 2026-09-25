Add-Type -AssemblyName System.Drawing

$json = Get-Content "scripts/svg_paths.json" | ConvertFrom-Json

function Draw-SvgPath($svgD, $outPath, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(255, 11, 12, 16)) # Obsidian bg

    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
    
    # Parse M and L commands
    $tokens = $svgD.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
    $pts = New-Object System.Collections.Generic.List[System.Drawing.PointF]
    for ($i = 0; $i -lt $tokens.Length; $i++) {
        $t = $tokens[$i]
        if ($t -eq "M" -or $t -eq "L") {
            $x = [float]$tokens[++$i]
            $y = [float]$tokens[++$i]
            $pts.Add((New-Object System.Drawing.PointF($x, $y)))
        }
    }

    if ($pts.Count -gt 2) {
        $gp.AddPolygon($pts.ToArray())
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 18, 14, 22))
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 180, 25, 35), 2.0)
        $g.FillPath($brush, $gp)
        $g.DrawPath($pen, $gp)
        $brush.Dispose()
        $pen.Dispose()
    }

    $g.Dispose()
    $gp.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

Draw-SvgPath $json.rio "scripts/rio_svg_test.png" 768 1376
Draw-SvgPath $json.prof "scripts/prof_svg_test.png" 768 1376
Write-Host "Drawn both SVG test images successfully!"
