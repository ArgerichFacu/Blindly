import Constants from "expo-constants";
import { Platform } from "react-native";

// Sólo la aplicación Android separada admite la demostración local.
// Las RPC conservan su verificación de Plus: esto no concede acceso al servidor.
export const PLUS_DEMO = Platform.OS === "android"
  && Constants.expoConfig?.android?.package === "com.blindly.app.plusdemo"
  && Constants.expoConfig?.extra?.plusDemo === true;
