Add-Type -AssemblyName System.Drawing

function Analyze-Asset($path, $name) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "=== $name ($w x $h) ==="

    # Sample corners and borders
    $bgSamples = @()
    for ($x = 0; $x -lt $w; $x += 20) {
        $bgSamples += $bmp.GetPixel($x, 0)
        $bgSamples += $bmp.GetPixel($x, 10)
        $bgSamples += $bmp.GetPixel($x, 20)
    }
    for ($y = 0; $y -lt $h; $y += 20) {
        $bgSamples += $bmp.GetPixel(0, $y)
        $bgSamples += $bmp.GetPixel(10, $y)
        $bgSamples += $bmp.GetPixel($w - 1, $y)
        $bgSamples += $bmp.GetPixel($w - 11, $y)
    }

    $avgR = ($bgSamples | Measure-Object -Property R -Average).Average
    $avgG = ($bgSamples | Measure-Object -Property G -Average).Average
    $avgB = ($bgSamples | Measure-Object -Property B -Average).Average
    $maxR = ($bgSamples | Measure-Object -Property R -Maximum).Maximum
    $maxG = ($bgSamples | Measure-Object -Property G -Maximum).Maximum
    $maxB = ($bgSamples | Measure-Object -Property B -Maximum).Maximum

    Write-Host "Background border average: R=$([int]$avgR), G=$([int]$avgG), B=$([int]$avgB)"
    Write-Host "Background border max: R=$maxR, G=$maxG, B=$maxB"
    $bmp.Dispose()
}

Analyze-Asset 'c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_exchange_shadow.jpg' 'Rio Exchange'
Analyze-Asset 'c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_exchange_shadow.jpg' 'Professor Exchange'
