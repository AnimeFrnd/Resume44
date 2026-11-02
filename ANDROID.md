# Resume44 – Android app

This branch (`android-apk-setup`) wraps the existing website in an Android app using
[Capacitor](https://capacitorjs.com/). The original website files (`index.html`, `css/`, `js/`)
are **not modified**.

## Get the APK

Every push to this branch runs the **Android APK** GitHub Actions workflow
(`.github/workflows/android-apk.yml`). When it succeeds the APK is published at a fixed link:

<https://github.com/AnimeFrnd/Resume44/releases/download/apk-latest/Resume44-debug.apk>

You can also start a build by hand: **Actions → Android APK → Run workflow**.

Install on a phone: download the APK, open it, and allow "Install unknown apps" for your
browser or file manager when Android asks.

## How it works

| Piece | What it does |
| --- | --- |
| `package.json` | Capacitor core/CLI/Android + the `Filesystem` and `Share` plugins the site uses to save PDFs |
| `capacitor.config.json` | App id `com.resume44.app`, name `Resume44`, web folder `www` |
| `scripts/prepare-web.js` | Copies the site into `www/` (and adds `scripts/native-shim.js` to the copy only) |
| `scripts/android_setup.py` | After `cap add android`: storage permissions, version from run number, icon, splash |
| `.github/workflows/android-apk.yml` | Installs everything, builds the debug APK, publishes the release link |

The `android/` and `www/` folders are generated during the build and are not committed.

## Build locally (needs Node 22+, JDK 21, Android SDK, Python + Pillow)

```bash
npm install
npm run build:web
npx cap add android
python3 scripts/android_setup.py android
npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Notes

- The APK is a **debug build** (signed with Android's debug key). That is fine for installing on
  your own devices. For Google Play you need a release build signed with your own keystore.
- The app still loads jsPDF, fonts and the AI backend over the internet, same as the website.
- The AI backend (`window.R44_API` in `index.html`) will see requests from the origin
  `https://localhost` when called from the app. If the server restricts CORS to the website's
  domain, add `https://localhost` to its allowed origins.
