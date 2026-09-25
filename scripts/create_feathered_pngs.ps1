Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class NaturalSilhouetteProcessor {
    public static void Process(string inputPath, string outputPath, int threshold, int dilateEdge) {
        using (Bitmap src = new Bitmap(inputPath)) {
            int w = src.Width;
            int h = src.Height;

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = Math.Abs(srcData.Stride);
            int bytes = stride * h;
            byte[] srcBuf = new byte[bytes];
            System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, srcBuf, 0, bytes);
            src.UnlockBits(srcData);

            // 1. Detect figure edge pixels (where brightness > threshold)
            bool[] isFigureEdge = new bool[w * h];
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    int bIdx = y * stride + x * 4;
                    int r = srcBuf[bIdx + 2];
                    int g = srcBuf[bIdx + 1];
                    int b = srcBuf[bIdx];
                    int maxC = Math.Max(r, Math.Max(g, b));
                    // Ignore border pixels within 5px of frame to avoid border noise
                    if (x > 8 && x < w - 8 && y > 8 && y < h - 8) {
                        isFigureEdge[y * w + x] = (maxC >= threshold);
                    }
                }
            }

            // 2. Dilate edge slightly (e.g. 3-4 px) ONLY to close any anti-aliased gaps
            bool[] barrier = new bool[w * h];
            for (int y = 0; y < h; y++) {
                int yMin = Math.Max(0, y - dilateEdge);
                int yMax = Math.Min(h - 1, y + dilateEdge);
                for (int x = 0; x < w; x++) {
                    if (isFigureEdge[y * w + x]) {
                        int xMin = Math.Max(0, x - dilateEdge);
                        int xMax = Math.Min(w - 1, x + dilateEdge);
                        for (int ny = yMin; ny <= yMax; ny++) {
                            for (int nx = xMin; nx <= xMax; nx++) {
                                barrier[ny * w + nx] = true;
                            }
                        }
                    }
                }
            }

            // 3. Flood fill background from 4 borders
            bool[] isBg = new bool[w * h];
            Queue<int> q = new Queue<int>();

            for (int x = 0; x < w; x++) {
                isBg[x] = true; q.Enqueue(x);
                int bIdx = (h - 1) * w + x;
                isBg[bIdx] = true; q.Enqueue(bIdx);
            }
            for (int y = 1; y < h - 1; y++) {
                int lIdx = y * w;
                isBg[lIdx] = true; q.Enqueue(lIdx);
                int rIdx = y * w + (w - 1);
                isBg[rIdx] = true; q.Enqueue(rIdx);
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

            // 4. Create raw alpha mask (0 for background, 240 for figure)
            byte[] alphaMask = new byte[w * h];
            for (int y = 0; y < h; y++) {
                double bottomFade = 1.0;
                if (y > h * 0.78) {
                    bottomFade = Math.Max(0.0, 1.0 - ((y - h * 0.78) / (h * 0.22)));
                }

                for (int x = 0; x < w; x++) {
                    int idx = y * w + x;
                    if (!isBg[idx]) {
                        alphaMask[idx] = (byte)(230 * bottomFade);
                    }
                }
            }

            // 5. Feather edges (smooth 3x3 blur on alpha channel to remove any hard borders)
            byte[] featheredAlpha = new byte[w * h];
            for (int y = 1; y < h - 1; y++) {
                for (int x = 1; x < w - 1; x++) {
                    int sum = 0;
                    for (int dy = -1; dy <= 1; dy++) {
                        for (int dx = -1; dx <= 1; dx++) {
                            sum += alphaMask[(y + dy) * w + (x + dx)];
                        }
                    }
                    featheredAlpha[y * w + x] = (byte)(sum / 9);
                }
            }

            // 6. Write final 32bpp ARGB PNG
            using (Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                BitmapData dstData = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                byte[] dstBuf = new byte[bytes];

                for (int y = 0; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int pIdx = y * w + x;
                        int bIdx = y * dstData.Stride + x * 4;

                        byte alpha = featheredAlpha[pIdx];
                        if (alpha == 0) {
                            dstBuf[bIdx] = 0;
                            dstBuf[bIdx + 1] = 0;
                            dstBuf[bIdx + 2] = 0;
                            dstBuf[bIdx + 3] = 0;
                        } else {
                            // Extract color or apply dark shadow + crimson rim
                            int r = srcBuf[bIdx + 2];
                            int g = srcBuf[bIdx + 1];
                            int b = srcBuf[bIdx];

                            byte outR, outG, outB;
                            if (r > 25) {
                                // Subtle crimson rim light fragment
                                outR = (byte)Math.Min(110, 20 + r * 0.7);
                                outG = (byte)Math.Min(22, 5 + g * 0.15);
                                outB = (byte)Math.Min(26, 8 + b * 0.15);
                            } else {
                                // Deep dark shadow silhouette body
                                outR = 12;
                                outG = 10;
                                outB = 14;
                            }

                            dstBuf[bIdx] = outB;
                            dstBuf[bIdx + 1] = outG;
                            dstBuf[bIdx + 2] = outR;
                            dstBuf[bIdx + 3] = alpha;
                        }
                    }
                }

                System.Runtime.InteropServices.Marshal.Copy(dstBuf, 0, dstData.Scan0, bytes);
                dst.UnlockBits(dstData);
                dst.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

[NaturalSilhouetteProcessor]::Process("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\prof_offer_clean_sil_1790347695272.jpg", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_transparent_clean.png", 5, 4)
[NaturalSilhouetteProcessor]::Process("C:\Users\airyc\.gemini\antigravity-ide\brain\32ddac22-b0bc-4f68-b0d1-b738ca8f31e6\rio_file_clean_sil_1790347666979.jpg", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_transparent_clean.png", 5, 5)

Write-Output "High-fidelity feathered transparent PNGs successfully created!"
