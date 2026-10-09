const { withProjectBuildGradle } = require("expo/config-plugins");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

// NDK r27's flexible-page switch only sets max-page-size. Android also
// requires common-page-size so GNU_RELRO ends on a 16 KB boundary.
const GRADLE = `
// Register before the React root plugin evaluates :app.
subprojects { nativeProject ->
    ['com.android.application', 'com.android.library'].each { pluginId ->
        nativeProject.pluginManager.withPlugin(pluginId) {
            nativeProject.extensions.getByName('androidComponents').finalizeDsl { androidDsl ->
                // React Native assigns the app's CMake path in another
                // finalizeDsl callback. Keep arguments even before that runs.
                def arguments = androidDsl.defaultConfig.externalNativeBuild.cmake.arguments
                def prefix = '-DCMAKE_SHARED_LINKER_FLAGS='
                def existing = arguments.find { it.startsWith(prefix) }
                def flags = existing == null ? '' : existing.substring(prefix.length())
                if (existing != null) arguments.remove(existing)
                ['-Wl,-z,max-page-size=16384', '-Wl,-z,common-page-size=16384'].each { flag ->
                    if (!flags.tokenize().contains(flag)) flags += ' ' + flag
                }
                arguments.add(prefix + flags.trim())
            }
        }
    }
}
gradle.projectsEvaluated {
    rootProject.subprojects.each { nativeProject ->
        def androidDsl = nativeProject.extensions.findByName('android')
        if (androidDsl != null && androidDsl.externalNativeBuild.cmake.path != null) {
            def arguments = androidDsl.defaultConfig.externalNativeBuild.cmake.arguments
            def flags = arguments.find { it.startsWith('-DCMAKE_SHARED_LINKER_FLAGS=') } ?: ''
            ['-Wl,-z,max-page-size=16384', '-Wl,-z,common-page-size=16384'].each { flag ->
                if (!flags.contains(flag)) {
                    throw new GradleException('Blindly: missing 16 KB linker flag in ' + nativeProject.path)
                }
            }
        }
    }
}
`;

module.exports = function withAndroidPageSizes(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error("Revisar la configuración 16 KB: se esperaba Gradle Groovy.");
    }
    config.modResults.contents = mergeContents({
      src: config.modResults.contents.replace(/\r\n/g, "\n"),
      newSrc: GRADLE.trim(),
      tag: "blindly-native-page-sizes",
      anchor: /apply plugin: "com.facebook.react.rootproject"/,
      // The React root plugin evaluates :app while it is being applied.
      // Register callbacks first, or the app DSL is already finalized.
      offset: 0,
      comment: "//",
    }).contents;
    return config;
  });
};
