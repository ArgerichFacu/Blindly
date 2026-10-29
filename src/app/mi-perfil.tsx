import Perfil from "./(principal)/perfil";
// El acceso desde Cuenta conserva su pila; no salta a la pestaña bajo una mesa.
export default function MiPerfil() { return <Perfil enTabs={false} />; }
