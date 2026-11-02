const { withGradleProperties, withAppBuildGradle } = require("expo/config-plugins");

// Expo 57 / RN 0.86 / AGP 8.12: generated native files are never the source
// of truth. Consumer rules from native dependencies remain in effect.
module.exports = function withAndroidReleaseOptimization(config) {
  config = withGradleProperties(config, config => {
    const properties = {
      "android.enableMinifyInReleaseBuilds": "true",
      "android.enableShrinkResourcesInReleaseBuilds": "true",
      "android.r8.optimizedResourceShrinking": "true",
    };
    config.modResults = config.modResults.filter(p =>
      p.type !== "property" || (!(p.key in properties) && p.key !== "android.enableR8.fullMode"));
    for (const [key, value] of Object.entries(properties)) config.modResults.push({ type: "property", key, value });
    return config;
  });
  return withAppBuildGradle(config, config => {
    if (config.modResults.language !== "groovy") throw new Error("Revisar optimización Android: se esperaba Gradle Groovy.");
    const contents = config.modResults.contents;
    if (!/getDefaultProguardFile\(["']proguard-android(?:-optimize)?\.txt["']\)/.test(contents)) {
      throw new Error("Cambió el template ProGuard de Expo; revisar antes de compilar.");
    }
    config.modResults.contents = contents.replace(/getDefaultProguardFile\((["'])proguard-android\.txt\1\)/g,
      'getDefaultProguardFile("proguard-android-optimize.txt")');
    return config;
  });
};
