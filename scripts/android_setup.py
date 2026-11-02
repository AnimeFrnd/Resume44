#!/usr/bin/env python3
"""Customise the Capacitor-generated Android project.

Run after `npx cap add android` (the android/ folder is generated in CI, not committed).

  1. Manifest: storage permissions so "Save PDF" can write to Documents (strict, fails the build if it can't).
  2. Version:  versionCode / versionName from the CI run number so each APK installs over the last.
  3. Branding: Resume44 launcher icon + splash screen (best effort; warns instead of failing).

Usage: python3 scripts/android_setup.py [android_dir]
"""
import glob
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "android"
MAIN = os.path.join(ROOT, "app", "src", "main")
RES = os.path.join(MAIN, "res")
MANIFEST = os.path.join(MAIN, "AndroidManifest.xml")
GRADLE = os.path.join(ROOT, "app", "build.gradle")

BLUE = (29, 91, 224)        # #1d5be0, same accent the website uses
WHITE = (255, 255, 255)
DENSITIES = {"mdpi": 1.0, "hdpi": 1.5, "xhdpi": 2.0, "xxhdpi": 3.0, "xxxhdpi": 4.0}


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


# ---------------------------------------------------------------- 1. manifest
def patch_manifest():
    s = read(MANIFEST)
    perms = [
        ("android.permission.READ_EXTERNAL_STORAGE", "32"),
        ("android.permission.WRITE_EXTERNAL_STORAGE", "29"),
    ]
    add = ""
    for name, max_sdk in perms:
        if name not in s:
            add += f'    <uses-permission android:name="{name}" android:maxSdkVersion="{max_sdk}" />\n'
    if add:
        if "</manifest>" not in s:
            raise RuntimeError("AndroidManifest.xml has no </manifest>")
        s = s.replace("</manifest>", add + "</manifest>", 1)
    if "requestLegacyExternalStorage" not in s:
        s, n = re.subn(r"<application\b", '<application\n        android:requestLegacyExternalStorage="true"', s, count=1)
        if n != 1:
            raise RuntimeError("AndroidManifest.xml has no <application> tag")
    write(MANIFEST, s)
    print("manifest: storage permissions set")


# ----------------------------------------------------------------- 2. version
def patch_version():
    run = int(os.environ.get("GITHUB_RUN_NUMBER", "1") or 1)
    s = read(GRADLE)
    s, n1 = re.subn(r"(versionCode\s*=?\s*)\d+", rf"\g<1>{run}", s, count=1)
    s, n2 = re.subn(r'(versionName\s*=?\s*)"[^"]*"', rf'\g<1>"1.0.{run}"', s, count=1)
    if not (n1 and n2):
        raise RuntimeError("versionCode/versionName not found in app/build.gradle")
    write(GRADLE, s)
    print(f"version: versionCode={run} versionName=1.0.{run}")


# ---------------------------------------------------------------- 3. branding
def load_font(size):
    from PIL import ImageFont
    for p in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    ):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def draw_centered(draw, cx, cy, text, font, fill):
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    draw.text((cx - (l + r) / 2, cy - (t + b) / 2), text, font=font, fill=fill)


def tile(size, bg, fg, shape="square", glyph_ratio=0.62):
    """Square/round tile with an 'R'. Rendered at 4x then downsampled for smooth edges."""
    from PIL import Image, ImageDraw
    k = 4
    big = Image.new("RGBA", (size * k, size * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    box = [0, 0, size * k - 1, size * k - 1]
    if shape == "round":
        d.ellipse(box, fill=bg)
    else:
        d.rounded_rectangle(box, radius=int(size * k * 0.22), fill=bg)
    draw_centered(d, size * k / 2, size * k / 2, "R", load_font(int(size * k * glyph_ratio)), fg)
    return big.resize((size, size), Image.LANCZOS)


def foreground(size):
    """Adaptive-icon foreground: transparent canvas, white 'R' inside the safe zone."""
    from PIL import Image, ImageDraw
    k = 4
    big = Image.new("RGBA", (size * k, size * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    draw_centered(d, size * k / 2, size * k / 2, "R", load_font(int(size * k * 0.42)), WHITE)
    return big.resize((size, size), Image.LANCZOS)


def brand_icons():
    for scale_name, scale in DENSITIES.items():
        folder = os.path.join(RES, f"mipmap-{scale_name}")
        os.makedirs(folder, exist_ok=True)
        for old in glob.glob(os.path.join(folder, "ic_launcher*.webp")):
            os.remove(old)
        legacy = int(round(48 * scale))
        adaptive = int(round(108 * scale))
        tile(legacy, BLUE, WHITE, "square").save(os.path.join(folder, "ic_launcher.png"))
        tile(legacy, BLUE, WHITE, "round").save(os.path.join(folder, "ic_launcher_round.png"))
        foreground(adaptive).save(os.path.join(folder, "ic_launcher_foreground.png"))
    write(os.path.join(RES, "values", "resume44_colors.xml"),
          '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
          '    <color name="resume44_icon_bg">#1D5BE0</color>\n</resources>\n')
    adaptive_xml = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@color/resume44_icon_bg"/>\n'
        '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
        '</adaptive-icon>\n')
    write(os.path.join(RES, "mipmap-anydpi-v26", "ic_launcher.xml"), adaptive_xml)
    write(os.path.join(RES, "mipmap-anydpi-v26", "ic_launcher_round.xml"), adaptive_xml)
    print("branding: launcher icons written")


def brand_splash():
    from PIL import Image, ImageDraw
    files = glob.glob(os.path.join(RES, "**", "splash.png"), recursive=True)
    for path in files:
        w, h = Image.open(path).size
        short = min(w, h)
        img = Image.new("RGB", (w, h), BLUE)
        t = tile(max(48, int(short * 0.22)), WHITE, BLUE, "square", 0.64)
        ty = int(h / 2 - t.size[1] * 0.75)
        img.paste(t, (int((w - t.size[0]) / 2), ty), t)
        d = ImageDraw.Draw(img)
        draw_centered(d, w / 2, ty + t.size[1] + short * 0.07, "Resume44", load_font(max(14, int(short * 0.06))), WHITE)
        img.save(path)
    print(f"branding: {len(files)} splash image(s) written")


def brand_splash_background():
    """Android 12+ shows the app icon on a plain background; make it blue instead of white."""
    path = os.path.join(RES, "values", "styles.xml")
    if not os.path.exists(path):
        print("branding: styles.xml not found, skipped splash background")
        return
    s = read(path)
    m = re.search(r'<style\s+name="AppTheme\.NoActionBarLaunch"[^>]*parent="Theme\.SplashScreen"[^>]*>.*?</style>', s, re.S)
    if not m:
        print("branding: launch theme is not Theme.SplashScreen, skipped splash background")
        return
    block = m.group(0)
    if "windowSplashScreenBackground" in block:
        return
    new_block = block.replace("</style>", '    <item name="windowSplashScreenBackground">@color/resume44_icon_bg</item>\n    </style>')
    write(path, s.replace(block, new_block, 1))
    print("branding: Android 12+ splash background set")


def main():
    patch_manifest()  # strict
    for step in (patch_version, brand_icons, brand_splash, brand_splash_background):
        try:
            step()
        except Exception as e:  # best effort: warn, keep building
            print(f"::warning::android_setup step '{step.__name__}' skipped: {e}")


if __name__ == "__main__":
    main()
