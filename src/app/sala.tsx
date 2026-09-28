import { useLocalSearchParams } from "expo-router";
import { Mesa } from "../components/Mesa";
export default function Sala() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  return <Mesa codigo={codigo ?? ""} />;
}
