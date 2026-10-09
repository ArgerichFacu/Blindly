import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Platform } from "react-native";
export function EntradaSuave({ children }: {
    children: ReactNode;
}) {
    const [opacidad] = useState(() => new Animated.Value(1));
    useEffect(() => {
        let vivo = true;
        void AccessibilityInfo.isReduceMotionEnabled().then(reducir => {
            if (!vivo || reducir)
                return;
            opacidad.setValue(.75);
            Animated.timing(opacidad, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== "web" }).start();
        }).catch(() => { });
        return () => { vivo = false; opacidad.stopAnimation(); };
    }, [opacidad]);
    return <Animated.View style={{ opacity: opacidad }}>{children}</Animated.View>;
}
