import { Superficie } from "./Superficie";
import { Icono, type NombreIcono } from "./Icono";
import { useVolver } from "../lib/useVolver";
import { estiloFuente } from "../lib/tipografia";
import { RADIOS, TACTIL_MINIMO } from "../lib/temas";
import { useState, type ReactNode, type RefObject } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";

// Identidad "Marcador": superficies planas, botón principal claro, sin degradés ni brillo.
// Ver docs/brand/BRAND.md.

export function Texto({
  children,
  suave = false,
  style,
  selectable = false,
  numberOfLines,
  accessibilityLiveRegion,
  maxFontSizeMultiplier,
  condensada,
}: {
  children: ReactNode;
  suave?: boolean;
  style?: StyleProp<TextStyle>;
  selectable?: boolean;
  numberOfLines?: number;
  accessibilityLiveRegion?: "none" | "polite" | "assertive";
  maxFontSizeMultiplier?: number;
  condensada?: boolean;
}) {
  const { tema } = useTema();
  const personalizado = StyleSheet.flatten(style);
  const fontSize = personalizado?.fontSize ?? 14;
  const lineHeight = Math.max(
    personalizado?.lineHeight ?? Math.ceil(fontSize * 1.5),
    Math.ceil(fontSize * 1.2),
  );
  return (
    <Text
      selectable={selectable}
      numberOfLines={numberOfLines}
      accessibilityLiveRegion={accessibilityLiveRegion}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        estilos.texto,
        { color: suave ? tema.textoSecundario : tema.texto },
        style,
        estiloFuente(personalizado, condensada),
        { lineHeight, includeFontPadding: true, flexShrink: 1, minWidth: 0 },
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
  icono,
}: {
  titulo: string;
  onPress: () => void;
  disabled?: boolean;
  secundario?: boolean;
  compacto?: boolean;
  style?: StyleProp<ViewStyle>;
  accesibilidad?: string;
  icono?: NombreIcono;
}) {
  const { tema } = useTema();
  // Deshabilitado: contorno tenue y texto secundario (un relleno claro atenuado se veía gris barro).
  const tinta = disabled ? tema.textoSecundario : secundario ? tema.texto : tema.textoAccion;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accesibilidad ?? titulo}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        estilos.boton,
        { minWidth: 0, flexShrink: 1 },
        {
          backgroundColor: secundario || disabled ? "transparent" : tema.accionPrimaria,
          borderColor: disabled ? tema.borde : secundario ? tema.bordeControl : tema.accionPrimaria,
          opacity: pressed ? 0.8 : 1,
        },
        compacto && { paddingHorizontal: 14, paddingVertical: 10 },
        style,
      ]}
    >
      {icono && <Icono nombre={icono} color={tinta} size={20} />}
      <Text style={[estilos.textoBoton, estiloFuente({ fontSize: 16, fontWeight: "600" }), { color: tinta, flexShrink: 1, minWidth: 0, includeFontPadding: true }]}>
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
      <Texto suave style={{ fontSize: 14, fontWeight: "500" }}>
        {etiqueta}
      </Texto>
      <TextInput
        {...props}
        accessibilityLabel={etiqueta}
        placeholderTextColor={tema.textoSecundario}
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
          estiloFuente({ fontSize: 17 }),
          {
            color: tema.texto,
            borderColor: focus ? tema.acento : tema.bordeControl,
            borderWidth: focus ? 2 : 1,
            padding: focus ? 12 : 13,
            backgroundColor: tema.superficie,
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
  variante = "panel",
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variante?: "panel" | "hero" | "suave";
}) {
  return <Superficie variante={variante} style={style}>{children}</Superficie>;
}
// Píldora de estado ("Recomendado", "En turno", "Plus"). Sin mayúsculas decorativas.
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
        backgroundColor: activa ? tema.acento : "transparent",
        borderWidth: 1,
        borderColor: activa ? tema.acento : tema.bordeControl,
        borderRadius: RADIOS.chico,
        paddingHorizontal: 8,
        paddingVertical: 2,
      }}
    >
      <Texto
        style={{
          fontSize: 12,
          lineHeight: 18,
          fontWeight: "600",
          color: activa ? tema.textoAccion : tema.textoSecundario,
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
  icono,
  onPress,
  activo = false,
  disabled = false,
  insignia,
}: {
  titulo: string;
  detalle: string;
  icono?: NombreIcono;
  onPress: () => void;
  activo?: boolean;
  disabled?: boolean;
  insignia?: string;
}) {
  const { tema } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[titulo, insignia, detalle].filter(Boolean).join(". ")}
      accessibilityState={{ disabled, selected: activo }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.acceso,
        {
          backgroundColor: tema.superficie,
          borderColor: activo ? tema.acento : tema.borde,
          borderWidth: activo ? 2 : 1,
          padding: activo ? 15 : 16,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {icono && (
        <View style={[estilos.simbolo, { backgroundColor: tema.superficieElevada }]}>
          <Icono nombre={icono} color={activo ? tema.acento : tema.texto} size={22} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <Texto style={{ fontSize: 17, fontWeight: "600" }}>{titulo}</Texto>
          {!!insignia && <Etiqueta activa>{insignia}</Etiqueta>}
        </View>
        <Texto suave style={{ fontSize: 14, lineHeight: 20 }}>
          {detalle}
        </Texto>
      </View>
      {activo ? <Icono nombre="check" color={tema.acento} size={22} /> : <Icono nombre="flecha" color={tema.textoSecundario} size={20} />}
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
        paddingTop: 8,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={titulo}
        accessibilityState={{ expanded: abierta }}
        onPress={() => setAbierta(!abierta)}
        style={{
          minHeight: TACTIL_MINIMO,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Texto style={{ fontSize: 16, fontWeight: "600", flex: 1 }}>{titulo}</Texto>
        <View style={{ transform: [{ rotate: abierta ? "-90deg" : "90deg" }] }}>
          <Icono nombre="flecha" color={tema.textoSecundario} size={20} />
        </View>
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
        <View key={label} style={{ flex: 1, gap: 6 }}>
          <View
            style={{
              height: 4,
              borderRadius: 1,
              backgroundColor: i < actual ? tema.texto : i === actual ? tema.acento : tema.borde,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {i < actual && <Icono nombre="check" color={tema.textoSecundario} size={14} />}
            <Texto
              suave={i !== actual}
              style={{ fontSize: 13, lineHeight: 18, fontWeight: i === actual ? "600" : "400" }}
            >
              {i < actual ? t(label) : `${i + 1} ${t(label)}`}
            </Texto>
          </View>
        </View>
      ))}
    </View>
  );
}
export function Pantalla({
  titulo,
  children,
  volver = true,
  onVolver,
  subtitulo,
  pie,
  scrollRef,
  alMedirContenido,
  cabecera = true,
  enTabs = false,
}: {
  titulo: string;
  children: ReactNode;
  volver?: boolean;
  onVolver?: () => void;
  subtitulo?: string;
  pie?: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
  alMedirContenido?: () => void;
  cabecera?: boolean;
  enTabs?: boolean;
}) {
  const { tema } = useTema(),
    { t } = usePreferencias();
  const regresar = useVolver(volver && !onVolver);
  const { fontScale } = useWindowDimensions();
  return (
    <SafeAreaView edges={enTabs ? ["top", "left", "right"] : ["top", "bottom", "left", "right"]} style={{ flex: 1, backgroundColor: tema.fondo }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={alMedirContenido}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={estilos.pagina}
        >
          {cabecera && <View style={estilos.cabecera}>
            {volver && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("Volver")}
                hitSlop={4}
                onPress={onVolver ?? regresar}
                style={({ pressed }) => [estilos.volver, { borderColor: tema.bordeControl, opacity: pressed ? 0.7 : 1 }]}
              >
                <Icono nombre="volver" color={tema.texto} size={22} />
              </Pressable>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Texto style={[estilos.titulo, (titulo.length > 20 || fontScale > 1.4) && { fontSize: 24, lineHeight: 30 }]}>{titulo}</Texto>
              {!!subtitulo && (
                <Texto suave style={{ fontSize: 14, lineHeight: 20 }}>
                  {subtitulo}
                </Texto>
              )}
            </View>
          </View>}
          {children}
        </ScrollView>
        {!!pie && (
          <View
            style={{
              backgroundColor: tema.superficie,
              maxHeight: "60%",
              borderTopWidth: 1,
              borderColor: tema.borde,
            }}
          >
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={estilos.pie}>{pie}</ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const estilos = StyleSheet.create({
  pagina: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  volver: {
    minHeight: TACTIL_MINIMO,
    width: TACTIL_MINIMO,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: RADIOS.control,
  },
  titulo: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },
  texto: { fontSize: 14, lineHeight: 21 },
  textoBoton: { fontSize: 16, textAlign: "center" },
  boton: {
    minHeight: TACTIL_MINIMO,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIOS.control,
    borderWidth: 1.5,
  },
  campo: { gap: 6, flexGrow: 1, flexShrink: 1, minWidth: 0 },
  input: {
    fontSize: 17,
    lineHeight: 24,
    minHeight: 52,
    borderRadius: RADIOS.control,
  },
  acceso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: RADIOS.panel,
    minHeight: 80,
  },
  simbolo: {
    height: 44,
    width: 44,
    borderRadius: RADIOS.control,
    alignItems: "center",
    justifyContent: "center",
  },
  pie: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
});
