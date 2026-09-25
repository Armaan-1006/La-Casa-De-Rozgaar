Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Text;

public class MooreTracer {
    // 8-connected neighbors in clockwise order: N, NE, E, SE, S, SW, W, NW
    static int[] dx = { 0, 1, 1, 1, 0, -1, -1, -1 };
    static int[] dy = { -1, -1, 0, 1, 1, 1, 0, -1 };

    public static string Trace(string imgPath, int alphaThresh) {
        using (Bitmap bmp = new Bitmap(imgPath)) {
            int w = bmp.Width;
            int h = bmp.Height;

            BitmapData data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = Math.Abs(data.Stride);
            byte[] buf = new byte[stride * h];
            System.Runtime.InteropServices.Marshal.Copy(data.Scan0, buf, 0, buf.Length);
            bmp.UnlockBits(data);

            bool[,] grid = new bool[w, h];
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    grid[x, y] = (buf[y * stride + x * 4 + 3] > alphaThresh);
                }
            }

            // Find starting point (first pixel with grid == true from top)
            int startX = -1, startY = -1;
            for (int y = 0; y < h && startY == -1; y++) {
                for (int x = 0; x < w; x++) {
                    if (grid[x, y]) {
                        startX = x;
                        startY = y;
                        break;
                    }
                }
            }

            if (startX == -1) return "";

            List<Point> contour = new List<Point>();
            int currX = startX;
            int currY = startY;
            contour.Add(new Point(currX, currY));

            int backtrackDir = 0; // Came from North
            int maxSteps = 20000;
            int stepCount = 0;

            while (stepCount++ < maxSteps) {
                // Check neighbors clockwise starting from (backtrackDir + 5) % 8
                int startCheck = (backtrackDir + 5) % 8;
                int foundDir = -1;

                for (int i = 0; i < 8; i++) {
                    int d = (startCheck + i) % 8;
                    int nx = currX + dx[d];
                    int ny = currY + dy[d];

                    if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[nx, ny]) {
                        foundDir = d;
                        currX = nx;
                        currY = ny;
                        backtrackDir = (d + 4) % 8;
                        break;
                    }
                }

                if (foundDir == -1) break; // isolated pixel

                if (currX == startX && currY == startY && contour.Count > 10) {
                    break; // Closed loop completed!
                }

                contour.Add(new Point(currX, currY));
            }

            // Sample every 4th point for smoothness
            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("M {0} {1} ", contour[0].X, contour[0].Y);
            for (int i = 4; i < contour.Count; i += 4) {
                sb.AppendFormat("L {0} {1} ", contour[i].X, contour[i].Y);
            }
            sb.Append("Z");
            return sb.ToString();
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$rioPath = [MooreTracer]::Trace("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347829674.png", 25)
$profPath = [MooreTracer]::Trace("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790348002971.png", 25)

Write-Host "Rio Moore contour path: $($rioPath.Length) chars"
Write-Host "Prof Moore contour path: $($profPath.Length) chars"

@{ rio = $rioPath; prof = $profPath } | ConvertTo-Json | Set-Content "scripts/svg_moore_paths.json"

# Re-draw test images
function Draw-SvgPath($svgD, $outPath, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(255, 11, 12, 16))

    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
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
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 20, 16, 24))
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 180, 30, 40), 2.0)
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

Draw-SvgPath $rioPath "scripts/rio_moore_test.png" 768 1376
Draw-SvgPath $profPath "scripts/prof_moore_test.png" 768 1376
Write-Host "Rendered Moore contour images successfully!"
