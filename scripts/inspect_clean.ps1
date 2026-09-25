Add-Type -AssemblyName System.Drawing

function Check-Pixels($path) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    Write-Host "File: $path"
    Write-Host "Size: $($bmp.Width) x $($bmp.Height)"
    Write-Host "Corner (0,0): $($bmp.GetPixel(0,0))"
    Write-Host "(10,10): $($bmp.GetPixel(10,10))"
    Write-Host "(100,100): $($bmp.GetPixel(100,100))"
    Write-Host "(200,200): $($bmp.GetPixel(200,200))"
    Write-Host "(Center): $($bmp.GetPixel($bmp.Width/2, $bmp.Height/2))"
    $bmp.Dispose()
}

Check-Pixels 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\prof_offer_clean_sil_1790347695272.jpg'
Check-Pixels 'C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\rio_file_clean_sil_1790347666979.jpg'
