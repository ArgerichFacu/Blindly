import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";

export function Texto({
  children,
  suave = false,
  style,
  selectable = false,
  numberOfLines,
}: {
  children: ReactNode;
  suave?: boolean;
  style?: StyleProp<TextStyle>;
  selectable?: boolean;
  numberOfLines?: number;
}) {
  const { tema } = useTema();
  return (
    <Text
      selectable={selectable}
      numberOfLines={numberOfLines}
      style={[
        estilos.texto,
        { color: suave ? tema.textoSuave : tema.textoFuerte },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Boton({
  titulo,
  onPress,
  disabled = false,
  secundario = false,
  compacto = false,
  style,
  accesibilidad,
}: {
  titulo: string;
  onPress: () => void;
  disabled?: boolean;
  secundario?: boolean;
  compacto?: boolean;
  style?: StyleProp<ViewStyle>;
  accesibilidad?: string;
}) {
  const { tema } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accesibilidad ?? titulo}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        estilos.boton,
        {
          backgroundColor: secundario ? tema.fondoTarjeta : tema.acento,
          borderColor: secundario ? tema.borde : tema.acento,
          opacity: disabled ? 0.42 : pressed ? 0.76 : 1,
        },
        compacto && {
          paddingHorizontal: 12,
          paddingVertical: 9,
          minHeight: 44,
        },
        style,
      ]}
    >
      <Text
        style={[
          estilos.textoBoton,
          { color: secundario ? tema.textoFuerte : tema.acentoTexto },
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}
export function Campo({
  etiqueta,
  ...props
}: TextInputProps & { etiqueta: string }) {
  const { tema } = useTema();
  const [focus, setFocus] = useState(false);
  return (
    <View style={estilos.campo}>
      <Texto suave style={{ fontSize: 12, fontWeight: "600" }}>
        {etiqueta}
      </Texto>
      <TextInput
        {...props}
        accessibilityLabel={etiqueta}
        placeholderTextColor={tema.textoSuave}
        selectionColor={tema.acento}
        onFocus={(e) => {
          setFocus(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          props.onBlur?.(e);
        }}
        style={[
          estilos.input,
          {
            color: tema.textoFuerte,
            borderColor: focus ? tema.acento : tema.borde,
            backgroundColor: tema.fondo,
          },
          props.style,
        ]}
      />
    </View>
  );
}
export function Tarjeta({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { tema } = useTema();
  return (
    <View
      style={[
        estilos.tarjeta,
        { backgroundColor: tema.fondoTarjeta, borderColor: tema.borde },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Etiqueta({
  children,
  activa = false,
}: {
  children: ReactNode;
  activa?: boolean;
}) {
  const { tema } = useTema();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: activa ? tema.acento : tema.fondoTarjeta,
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 4,
      }}
    >
      <Texto
        style={{
          fontSize: 10,
          lineHeight: 15,
          fontWeight: "800",
          letterSpacing: 0.8,
          color: activa ? tema.acentoTexto : tema.textoSuave,
        }}
      >
        {children}
      </Texto>
    </View>
  );
}
export function Acceso({
  titulo,
  detalle,
  simbolo,
  onPress,
  activo = false,
  disabled = false,
}: {
  titulo: string;
  detalle: string;
  simbolo?: string;
  onPress: () => void;
  activo?: boolean;
  disabled?: boolean;
}) {
  const { tema } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled, selected: activo }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.acceso,
        {
          backgroundColor: tema.fondoTarjeta,
          borderColor: activo ? tema.acento : tema.borde,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {simbolo && (
        <View style={[estilos.simbolo, { backgroundColor: tema.fondo }]}>
          <Texto
            style={{ color: tema.acento, fontSize: 22, fontWeight: "600" }}
          >
            {simbolo}
          </Texto>
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <Texto style={{ fontSize: 16, fontWeight: "700" }}>{titulo}</Texto>
        <Texto suave style={{ fontSize: 12, lineHeight: 18 }}>
          {detalle}
        </Texto>
      </View>
      <Texto style={{ color: tema.acento, fontSize: 22 }}>
        {activo ? "✓" : "›"}
      </Texto>
    </Pressable>
  );
}
export function Seccion({
  titulo,
  children,
  inicial = false,
}: {
  titulo: string;
  children: ReactNode;
  inicial?: boolean;
}) {
  const [abierta, setAbierta] = useState(inicial);
  const { tema } = useTema();
  return (
    <View
      style={{
        gap: 12,
        borderTopWidth: 1,
        borderColor: tema.borde,
        paddingTop: 6,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={titulo}
        accessibilityState={{ expanded: abierta }}
        onPress={() => setAbierta(!abierta)}
        style={{
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Texto style={{ fontWeight: "600", flex: 1 }}>{titulo}</Texto>
        <Texto suave>{abierta ? "−" : "+"}</Texto>
      </Pressable>
      {
        <View style={{ display: abierta ? "flex" : "none", gap: 12 }}>
          {children}
        </View>
      }
    </View>
  );
}
export function Pasos({ actual }: { actual: number }) {
  const { tema } = useTema(),
    { t } = usePreferencias();
  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
      {["Invitar", "Asientos", "Preparar"].map((label, i) => (
        <View key={label} style={{ flex: 1, gap: 7 }}>
          <View
            style={{
              height: 3,
              borderRadius: 3,
              backgroundColor: i <= actual ? tema.acento : tema.borde,
            }}
          />
          <Texto
            suave
            style={{
              fontSize: 10,
              lineHeight: 16,
              fontWeight: i === actual ? "800" : "400",
              color: i === actual ? tema.acento : tema.textoSuave,
            }}
          >
            {i < actual ? "✓" : i + 1} {t(label)}
          </Texto>
        </View>
      ))}
    </View>
  );
}
export function Pantalla({
  titulo,
  children,
  volver = true,
  subtitulo,
  pie,
}: {
  titulo: string;
  children: ReactNode;
  volver?: boolean;
  subtitulo?: string;
  pie?: ReactNode;
}) {
  const { tema } = useTema(),
    router = useRouter(),
    { t } = usePreferencias();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.fondo }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={estilos.pagina}
        >
          <View style={estilos.cabecera}>
            {volver && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("Volver")}
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace("/")
                }
                style={[estilos.volver, { borderColor: tema.borde }]}
              >
                <Texto style={{ fontSize: 22 }}>‹</Texto>
              </Pressable>
            )}
            <View style={{ flex: 1, gap: 3 }}>
              <Texto style={estilos.titulo}>{titulo}</Texto>
              {!!subtitulo && (
                <Texto suave style={{ fontSize: 13, lineHeight: 19 }}>
                  {subtitulo}
                </Texto>
              )}
            </View>
            {volver && (
              <Texto style={{ color: tema.acento, fontSize: 22 }}>♠</Texto>
            )}
          </View>
          {children}
        </ScrollView>
        {!!pie && (
          <View
            style={{
              backgroundColor: tema.fondoTarjeta,
              borderTopWidth: 1,
              borderColor: tema.borde,
            }}
          >
            <View style={estilos.pie}>{pie}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const estilos = StyleSheet.create({
  pagina: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 2,
  },
  volver: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 14,
  },
  titulo: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  texto: { fontSize: 14, lineHeight: 21 },
  textoBoton: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  boton: {
    minHeight: 50,
    justifyContent: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  campo: { gap: 7, flexGrow: 1, flexShrink: 1, minWidth: 0 },
  input: {
    fontSize: 17,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 13,
    padding: 13,
  },
  tarjeta: { padding: 18, borderRadius: 20, gap: 12, borderWidth: 1 },
  acceso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    minHeight: 90,
  },
  simbolo: {
    height: 44,
    width: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pie: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
});
