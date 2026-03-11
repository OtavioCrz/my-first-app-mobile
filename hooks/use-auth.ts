import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null); 
  const [isLoading, setIsLoading] = useState(true); // Estado para indicar se a autenticação ainda está sendo verificada. Começa como true porque quando o componente é montado, ainda não sabemos se o usuário está autenticado ou não


  //verificar se o usuario está ou não logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, isLoading }; // Retorna o usuário autenticado (ou null se não houver) e o estado de carregamento para que os componentes possam usar essas informações para renderizar a interface de acordo com o status de autenticação do usuário
}