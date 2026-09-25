Add-Type -AssemblyName System.Drawing

$rioPath = 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347117458.jpg'
$rio = New-Object System.Drawing.Bitmap($rioPath)
Write-Host "Rio size: $($rio.Width) x $($rio.Height)"
Write-Host "Rio (0,0): $($rio.GetPixel(0,0))"
Write-Host "Rio (10,10): $($rio.GetPixel(10,10))"
Write-Host "Rio (200,100): $($rio.GetPixel(200,100))"
Write-Host "Rio (100,500): $($rio.GetPixel(100,500))"
$rio.Dispose()

$profPath = 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347135769.jpg'
$prof = New-Object System.Drawing.Bitmap($profPath)
Write-Host "Prof size: $($prof.Width) x $($prof.Height)"
Write-Host "Prof (0,0): $($prof.GetPixel(0,0))"
Write-Host "Prof (10,10): $($prof.GetPixel(10,10))"
Write-Host "Prof (200,100): $($prof.GetPixel(200,100))"
Write-Host "Prof (100,500): $($prof.GetPixel(100,500))"
$prof.Dispose()
