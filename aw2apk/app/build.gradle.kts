plugins {
    id("com.android.application")
}

android {
    namespace = "com.battosensei.advancewars2"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.battosensei.advancewars2"
        minSdk = 24
        targetSdk = 35
        versionCode = 4
        versionName = "1.3"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
        }
    }

    androidResources {
        noCompress += "gba"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
