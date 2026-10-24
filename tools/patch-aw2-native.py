from pathlib import Path
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "native/android")

manifest = root / "app/src/main/AndroidManifest.xml"
text = manifest.read_text()

old_library = """        <activity
            android:name=".LibraryActivity"
            android:exported="true"
            android:label="@string/app_name">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>"""
new_library = """        <activity
            android:name=".LibraryActivity"
            android:exported="false"
            android:label="@string/app_name" />"""
if old_library not in text:
    raise SystemExit("LibraryActivity manifest block not found")
text = text.replace(old_library, new_library)

old_main = """        <activity
            android:name=".MainActivity"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
            android:exported="false" />"""
new_main = """        <activity
            android:name=".MainActivity"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
            android:exported="true"
            android:screenOrientation="landscape">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>"""
if old_main not in text:
    raise SystemExit("MainActivity manifest block not found")
manifest.write_text(text.replace(old_main, new_main))

java = root / "app/src/main/java/com/trebuchetdynamics/emulator/app/MainActivity.java"
src = java.read_text()
src = src.replace(
    "import java.io.IOException;\nimport java.io.OutputStream;",
    "import java.io.IOException;\nimport java.io.InputStream;\nimport java.io.OutputStream;"
)

old = """        library = new RomLibrary(getFilesDir());
        String requestedRomId = getIntent().getStringExtra(EXTRA_ROM_ID);"""
new = """        library = new RomLibrary(getFilesDir());
        installBundledRom();
        String requestedRomId = "zeldaminish";"""
if old not in src:
    raise SystemExit("MainActivity startup block not found")
src = src.replace(old, new)

anchor = "    private void applyOrientation() {"
method = """    private void installBundledRom() {
        final String romId = "zeldaminish";
        File directory = new File(getFilesDir(), "roms");
        if (!directory.isDirectory() && !directory.mkdirs()) {
            throw new IllegalStateException("Could not create ROM directory");
        }
        File destination = new File(directory, romId + ".gba");
        if (!destination.isFile() || destination.length() != 16777216L) {
            File temporary = new File(directory, romId + ".tmp");
            try (InputStream in = getAssets().open("game.gba");
                 FileOutputStream out = new FileOutputStream(temporary)) {
                byte[] buffer = new byte[64 * 1024];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
                out.getFD().sync();
            } catch (IOException e) {
                temporary.delete();
                throw new IllegalStateException("Could not install bundled ROM", e);
            }
            if (destination.exists() && !destination.delete()) {
                temporary.delete();
                throw new IllegalStateException("Could not replace bundled ROM");
            }
            if (!temporary.renameTo(destination)) {
                temporary.delete();
                throw new IllegalStateException("Could not finish bundled ROM install");
            }
        }
        try {
            library.record(
                romId,
                "The Minish Cap",
                RomSystem.GBA,
                System.currentTimeMillis());
        } catch (IOException e) {
            throw new IllegalStateException("Could not register bundled ROM", e);
        }
    }

"""
if anchor not in src:
    raise SystemExit("MainActivity method anchor not found")
java.write_text(src.replace(anchor, method + anchor))



strings = root / "app/src/main/res/values/strings.xml"
s = strings.read_text()
s = s.replace("<string name=\"app_name\">Garnacha Boy</string>", "<string name=\"app_name\">The Minish Cap</string>")
strings.write_text(s)

gradle = root / "app/build.gradle"
g = gradle.read_text()
g = g.replace("applicationId 'com.trebuchetdynamics.garnacha'", "applicationId 'com.battosensei.zeldaminishnative'")
marker = "    buildTypes {"
if marker not in g:
    raise SystemExit("Gradle buildTypes marker not found")
g = g.replace(marker, """    androidResources {
        noCompress 'gba'
    }

    buildTypes {""")
gradle.write_text(g)

assets = root / "app/src/main/assets"
assets.mkdir(parents=True, exist_ok=True)
(assets / "game.gba").write_bytes(bytes(16777216))
icon = root / "app/src/main/res/drawable/ic_launcher_foreground.xml"
icon.write_text("""<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path android:fillColor="#2F6B3D"
        android:pathData="M12,74 Q29,24 78,20 Q94,20 82,54 L54,92 L12,74 Z" />
    <path android:fillColor="#58A84F"
        android:pathData="M20,70 Q48,58 84,58 Q64,74 34,78 Q24,78 20,70 Z" />
    <path android:fillColor="#D9B34A"
        android:pathData="M54,24 L43,42 L65,42 Z M42,44 L31,62 L53,62 Z M56,44 L78,62 L67,62 Z M48,56 L60,56 L54,67 Z" />
    <path android:fillColor="#F4E6A8"
        android:pathData="M54,18 L49,26 L59,26 Z" />
</vector>""")

bg = root / "app/src/main/res/values/ic_launcher_background.xml"
bg.write_text("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#17311F</color>
</resources>
""")

print("Native Zelda Minish Cap patch applied")
