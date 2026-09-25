Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class SolidSilhouetteMaker {
    public static void CreateSolid(string inputPath, string outputPath, int edgeThresh, int dilateGaps) {
        using (Bitmap src = new Bitmap(inputPath)) {
            int w = src.Width;
            int h = src.Height;

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(srcData.Stride) * h;
            byte[] srcBuf = new byte[bytes];
            System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, srcBuf, 0, bytes);

            bool[] isEdge = new bool[w * h];
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    int bIdx = y * srcData.Stride + x * 4;
                    int r = srcBuf[bIdx + 2];
                    int g = srcBuf[bIdx + 1];
                    int b = srcBuf[bIdx];
                    int maxC = Math.Max(r, Math.Max(g, b));
                    isEdge[y * w + x] = (maxC >= edgeThresh);
                }
            }

            // Dilate edges by dilateGaps to seal gaps
            bool[] barrier = new bool[w * h];
            for (int y = 0; y < h; y++) {
                int yMin = Math.Max(0, y - dilateGaps);
                int yMax = Math.Min(h - 1, y + dilateGaps);
                for (int x = 0; x < w; x++) {
                    if (isEdge[y * w + x]) {
                        int xMin = Math.Max(0, x - dilateGaps);
                        int xMax = Math.Min(w - 1, x + dilateGaps);
                        for (int ny = yMin; ny <= yMax; ny++) {
                            for (int nx = xMin; nx <= xMax; nx++) {
                                barrier[ny * w + nx] = true;
                            }
                        }
                    }
                }
            }

            // Flood fill background from border
            bool[] isBg = new bool[w * h];
            Queue<int> q = new Queue<int>();

            for (int x = 0; x < w; x++) {
                if (!barrier[x]) { isBg[x] = true; q.Enqueue(x); }
                int bIdx = (h - 1) * w + x;
                if (!barrier[bIdx]) { isBg[bIdx] = true; q.Enqueue(bIdx); }
            }
            for (int y = 1; y < h - 1; y++) {
                int lIdx = y * w;
                if (!barrier[lIdx]) { isBg[lIdx] = true; q.Enqueue(lIdx); }
                int rIdx = y * w + (w - 1);
                if (!barrier[rIdx]) { isBg[rIdx] = true; q.Enqueue(rIdx); }
            }

            int[] dX = { 1, -1, 0, 0 };
            int[] dY = { 0, 0, 1, -1 };

            while (q.Count > 0) {
                int curr = q.Dequeue();
                int cx = curr % w;
                int cy = curr / w;

                for (int i = 0; i < 4; i++) {
                    int nx = cx + dX[i];
                    int ny = cy + dY[i];

                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        int nIdx = ny * w + nx;
                        if (!isBg[nIdx] && !barrier[nIdx]) {
                            isBg[nIdx] = true;
                            q.Enqueue(nIdx);
                        }
                    }
                }
            }

            // Destination 32bpp ARGB PNG
            using (Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                BitmapData dstData = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                byte[] dstBuf = new byte[bytes];

                for (int y = 0; y < h; y++) {
                    double vertFade = 1.0;
                    if (y > h * 0.82) {
                        vertFade = Math.Max(0.0, 1.0 - ((y - h * 0.82) / (h * 0.18)));
                    }

                    for (int x = 0; x < w; x++) {
                        int pIdx = y * w + x;
                        int bIdx = y * dstData.Stride + x * 4;

                        if (isBg[pIdx]) {
                            // 100% transparent: alpha = 0, NO BOX, NO PANEL
                            dstBuf[bIdx] = 0;
                            dstBuf[bIdx + 1] = 0;
                            dstBuf[bIdx + 2] = 0;
                            dstBuf[bIdx + 3] = 0;
                        } else {
                            byte r = srcBuf[bIdx + 2];
                            byte g = srcBuf[bIdx + 1];
                            byte b = srcBuf[bIdx];

                            byte outA = (byte)(235 * vertFade);
                            byte outR, outG, outB;

                            if (r > 30) {
                                outR = (byte)Math.Min(110, 25 + r * 0.65);
                                outG = (byte)Math.Min(20, 5 + g * 0.1);
                                outB = (byte)Math.Min(25, 8 + b * 0.1);
                            } else {
                                outR = 14;
                                outG = 11;
                                outB = 16;
                            }

                            dstBuf[bIdx] = outB;
                            dstBuf[bIdx + 1] = outG;
                            dstBuf[bIdx + 2] = outR;
                            dstBuf[bIdx + 3] = outA;
                        }
                    }
                }

                System.Runtime.InteropServices.Marshal.Copy(dstBuf, 0, dstData.Scan0, bytes);
                dst.UnlockBits(dstData);
                dst.Save(outputPath, ImageFormat.Png);
            }
            src.UnlockBits(srcData);
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

[SolidSilhouetteMaker]::CreateSolid("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\prof_offer_clean_sil_1790347695272.jpg", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_transparent_clean.png", 6, 24)
[SolidSilhouetteMaker]::CreateSolid("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\rio_file_clean_sil_1790347666979.jpg", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_transparent_clean.png", 18, 26)
Write-Output "Processing completed successfully!"
