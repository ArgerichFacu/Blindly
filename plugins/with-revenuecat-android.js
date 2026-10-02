const { withAndroidManifest } = require("expo/config-plugins");

const BILLING_PERMISSION = "com.android.vending.BILLING";

module.exports = function withRevenueCatAndroid(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest["uses-permission"] ?? [];

    if (
      !permissions.some(
        (permission) => permission.$?.["android:name"] === BILLING_PERMISSION,
      )
    ) {
      permissions.push({ $: { "android:name": BILLING_PERMISSION } });
      manifest["uses-permission"] = permissions;
    }

    const mainActivity = manifest.application?.[0]?.activity?.find((activity) =>
      activity.$?.["android:name"]?.endsWith("MainActivity"),
    );

    if (!mainActivity) {
      throw new Error("No se encontró MainActivity en AndroidManifest.xml");
    }

    mainActivity.$["android:launchMode"] = "singleTop";
    return config;
  });
};
