Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Text;

public class ContourTracer {
    public static string TraceOuterContour(string imagePath, int alphaThresh) {
        using (Bitmap bmp = new Bitmap(imagePath)) {
            int w = bmp.Width;
            int h = bmp.Height;

            BitmapData data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = Math.Abs(data.Stride);
            byte[] buf = new byte[stride * h];
            System.Runtime.InteropServices.Marshal.Copy(data.Scan0, buf, 0, buf.Length);
            bmp.UnlockBits(data);

            // Find for each Y the minX and maxX
            // To trace the closed loop: go down on right side, up on left side
            List<Point> rightSide = new List<Point>();
            List<Point> leftSide = new List<Point>();

            // Step by 4 for smooth manageable path
            int step = 4;
            for (int y = 50; y < h - 40; y += step) {
                int minX = -1;
                int maxX = -1;

                for (int x = 0; x < w; x++) {
                    int a = buf[y * stride + x * 4 + 3];
                    if (a > alphaThresh) {
                        if (minX == -1) minX = x;
                        maxX = x;
                    }
                }

                if (minX != -1 && maxX != -1 && maxX >= minX) {
                    leftSide.Add(new Point(minX, y));
                    rightSide.Add(new Point(maxX, y));
                }
            }

            if (leftSide.Count == 0) return "";

            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("M {0} {1} ", leftSide[0].X, leftSide[0].Y);

            // Go down the left side
            for (int i = 1; i < leftSide.Count; i++) {
                sb.AppendFormat("L {0} {1} ", leftSide[i].X, leftSide[i].Y);
            }

            // Go up the right side (in reverse)
            for (int i = rightSide.Count - 1; i >= 0; i--) {
                sb.AppendFormat("L {0} {1} ", rightSide[i].X, rightSide[i].Y);
            }

            sb.Append("Z");
            return sb.ToString();
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$rioPath = [ContourTracer]::TraceOuterContour("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347829674.png", 30)
$profPath = [ContourTracer]::TraceOuterContour("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790348002971.png", 30)

Write-Host "Rio path length: $($rioPath.Length)"
Write-Host "Prof path length: $($profPath.Length)"

# Save paths to file
@{ rio = $rioPath; prof = $profPath } | ConvertTo-Json | Set-Content "scripts/svg_paths.json"
Write-Host "Saved svg_paths.json successfully!"
