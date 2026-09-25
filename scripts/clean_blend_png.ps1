Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class NaturalImageBlender {
    public static void CleanBlend(string inPath, string outPath, double bgR, double bgG, double bgB, double featherRadius) {
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

                for (int y = 0; y < h; y++) {
                    // Elliptical falloff towards image boundaries (so edges NEVER touch the frame)
                    double normY = (double)y / h;
                    double distY = Math.Abs(normY - 0.5) * 2.0; // 0 at center, 1 at edges

                    for (int x = 0; x < w; x++) {
                        double normX = (double)x / w;
                        double distX = Math.Abs(normX - 0.5) * 2.0;

                        // Edge distance factor: smoothly fade to 0 starting at 75% of radius
                        double edgeDist = Math.Sqrt(distX * distX + distY * distY);
                        double frameFade = 1.0;
                        if (edgeDist > 0.70) {
                            frameFade = Math.Max(0.0, 1.0 - ((edgeDist - 0.70) / 0.30));
                        }

                        // Bottom vertical dissolve: leg/feet fade into floor shadow
                        if (normY > 0.75) {
                            frameFade *= Math.Max(0.0, 1.0 - ((normY - 0.75) / 0.25));
                        }
                        // Top fade: head contour fade into ceiling shadow
                        if (normY < 0.12) {
                            frameFade *= Math.Max(0.0, normY / 0.12);
                        }

                        int bIdx = y * stride + x * 4;
                        byte inB = srcBuf[bIdx];
                        byte inG = srcBuf[bIdx + 1];
                        byte inR = srcBuf[bIdx + 2];

                        // Distance from background studio color
                        double diffR = inR - bgR;
                        double diffG = inG - bgG;
                        double diffB = inB - bgB;
                        double colorDiff = Math.Sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

                        // If pixel is within background studio noise (colorDiff < 4.0), alpha = 0
                        double alphaFactor = 0.0;
                        if (colorDiff > 3.5) {
                            alphaFactor = Math.Min(1.0, (colorDiff - 3.5) / 8.0);
                        }

                        double finalAlpha = 255.0 * alphaFactor * frameFade;

                        if (finalAlpha <= 1.0) {
                            dstBuf[bIdx] = 0;
                            dstBuf[bIdx + 1] = 0;
                            dstBuf[bIdx + 2] = 0;
                            dstBuf[bIdx + 3] = 0;
                        } else {
                            // Deep shadow body: preserve red rim highlights while keeping body dark
                            byte outR, outG, outB;
                            if (inR > 25) {
                                outR = (byte)Math.Min(110, 25 + inR * 0.7);
                                outG = (byte)Math.Min(22, 5 + inG * 0.15);
                                outB = (byte)Math.Min(28, 8 + inB * 0.15);
                            } else {
                                outR = 12;
                                outG = 10;
                                outB = 14;
                            }

                            dstBuf[bIdx] = outB;
                            dstBuf[bIdx + 1] = outG;
                            dstBuf[bIdx + 2] = outR;
                            dstBuf[bIdx + 3] = (byte)finalAlpha;
                        }
                    }
                }

                System.Runtime.InteropServices.Marshal.Copy(dstBuf, 0, dstData.Scan0, dstBuf.Length);
                dst.UnlockBits(dstData);
                dst.Save(outPath, ImageFormat.Png);
            }
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

[NaturalImageBlender]::CleanBlend("c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_exchange_shadow.jpg", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\rio_natural_silhouette.png", 10.0, 15.0, 18.0, 1.0)
[NaturalImageBlender]::CleanBlend("c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_exchange_shadow.jpg", "c:\Users\airyc\Documents\GitHub\La-Casa-De-Rozgaar\public\images\professor_natural_silhouette.png", 12.5, 11.0, 12.0, 1.0)

Write-Host "Natural feathered silhouettes created successfully!"
