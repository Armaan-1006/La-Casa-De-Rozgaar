Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347829674.png")
Write-Host "Width: $($bmp.Width), Height: $($bmp.Height), Format: $($bmp.PixelFormat)"
Write-Host "Pixel (0,0): $($bmp.GetPixel(0,0))"
Write-Host "Pixel (10,10): $($bmp.GetPixel(10,10))"
$bmp.Dispose()
