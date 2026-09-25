Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class ScanlineFiller {
    public static void Fill(string inPath, string outPath, bool isProfessor) {
        using (Bitmap src = new Bitmap(inPath)) {
            int w = src.Width;
            int h = src.Height;

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = Math.Abs(srcData.Stride);
            byte[] srcBuf = new byte[stride * h];
            System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, srcBuf, 0, srcBuf.Length);
            src.UnlockBits(srcData);

            using (Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                BitmapData dstData = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                byte[] dstBuf = new byte[stride * h];

                // For each line, find minX and maxX where alpha > 20
                for (int y = 0; y < h; y++) {
                    int minX = -1;
                    int maxX = -1;

                    for (int x = 0; x < w; x++) {
                        int a = srcBuf[y * stride + x * 4 + 3];
                        if (a > 20) {
                            if (minX == -1) minX = x;
                            maxX = x;
                        }
                    }

                    if (minX != -1 && maxX != -1 && maxX > minX) {
                        double vertFade = 1.0;
                        if (y > h * 0.78) {
                            vertFade = Math.Max(0.0, 1.0 - ((y - h * 0.78) / (h * 0.22)));
                        }

                        for (int x = minX; x <= maxX; x++) {
                            int bIdx = y * stride + x * 4;
                            int srcA = srcBuf[bIdx + 3];
                            int srcR = srcBuf[bIdx + 2];

                            // Fill body with solid shadow
                            byte alpha = (byte)(230 * vertFade);
                            byte r = 12, g = 10, b = 14;

                            // If on edge with red tone, preserve subtle rim light
                            if (srcA > 40 && srcR > 30) {
                                r = (byte)Math.Min(110, 25 + srcR * 0.7);
                                g = (byte)Math.Min(22, 6 + srcBuf[bIdx + 1] * 0.15);
                                b = (byte)Math.Min(26, 8 + srcBuf[bIdx] * 0.15);
                            }

                            dstBuf[bIdx] = b;
                            dstBuf[bIdx + 1] = g;
                            dstBuf[bIdx + 2] = r;
                            dstBuf[bIdx + 3] = alpha;
                        }
                    }
                }

                // Smooth edges with 3x3 box blur on alpha only
                byte[] smoothBuf = (byte[])dstBuf.Clone();
                for (int y = 1; y < h - 1; y++) {
                    for (int x = 1; x < w - 1; x++) {
                        int idx = y * stride + x * 4 + 3;
                        if (dstBuf[idx] > 0 || dstBuf[(y - 1) * stride + x * 4 + 3] > 0 || dstBuf[(y + 1) * stride + x * 4 + 3] > 0) {
                            int sum = 0;
                            for (int dy = -1; dy <= 1; dy++) {
                                for (int dx = -1; dx <= 1; dx++) {
                                    sum += dstBuf[(y + dy) * stride + (x + dx) * 4 + 3];
                                }
                            }
                            smoothBuf[idx] = (byte)(sum / 9);
                        }
                    }
                }

                System.Runtime.InteropServices.Marshal.Copy(smoothBuf, 0, dstData.Scan0, dstBuf.Length);
                dst.UnlockBits(dstData);
                dst.Save(outPath, ImageFormat.Png);
            }
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

[ScanlineFiller]::Fill("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790347829674.png", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_solid_clean.png", $false)
[ScanlineFiller]::Fill("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\.tempmediaStorage\media_1790348002971.png", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_solid_clean.png", $true)

Write-Output "Successfully generated solid transparent silhouettes!"
