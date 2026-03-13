import { collection, doc, getDoc, getDocs } from "firebase/firestore"; //  collection aponta para uma coleção e getDocs busca os dados de uma coleção inteira, doc aponta para um documento específico, getDoc busca os dados de um documento específico
import React, { useEffect, useRef, useState } from "react"; // Importando React e os hooks useEffect e useState para gerenciar o estado e os efeitos colaterais
import { StyleSheet, View } from "react-native"; // Importando os componentes básicos do React Native
import MapView, { Marker } from "react-native-maps"; // Importando o MapView e Marker do react-native-maps
// sem getDoc, não lê o documento do supervisor.
import { auth, db } from "@/firebase/firebaseConfig"; // Importando a configuração do Firebase para acessar o Firestore

type Point = {
  // Definindo o tipo Point para representar os pontos a serem exibidos no mapa
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: string; // tipo opcional para diferenciar pontos, por exemplo, 'dc' para data centers e 'store' para lojas
};

export default function MapScreen() {
  const [points, setPoints] = useState<Point[]>([]); //points sempre será uma lista de Point e setPoints é a função para atualizar essa lista
  const mapRef = useRef<MapView | null>(null); // vai ser usado para ajustar região com o fitCordinates, mas não é obrigatório
  useEffect(() => {
    // useEffect é um hook que executa uma função após o componente ser montado. Aqui, ele é usado para carregar os pontos do Firestore quando o componente é renderizado pela primeira vez

    async function loadPoints() {
      /*const currentUserId = "nvuyVlWZWmSiMYeWlacGU95qK523"; //supervisor ou logistica simulado*/
      const currentUserId = auth.currentUser?.uid; // Obtém o ID do usuário atualmente autenticado usando o Firebase Authentication. O operador de encadeamento opcional (?.) é usado para evitar erros caso não haja um usuário autenticado, retornando undefined em vez de lançar um erro.
      if (!currentUserId) {
        return; // Se não houver um usuário autenticado, a função loadPoints é encerrada imediatamente, evitando tentativas de acessar dados do Firestore sem um usuário válido.
      }

      const userSnap = await getDoc(doc(db, "users", currentUserId)); //precisa saber quem é o usuário antes de puxar as lojas
      const userData = userSnap.data() || {};
      const role: string = userData?.role || "supervisor"; // se userData.role existir, use-o; caso contrário, use "supervisor" como valor padrão (se logistica = vê tudo; se supervisor = vê só os pontos relacionados a ele)
      const storeIds: string[] = userData?.storeIds || []; // se userData.storeIds existir, use-o; caso contrário, use uma lista vazia (se vazio = mostra somente o CD)

      const snapshot = await getDocs(collection(db, "stores")); // getDocs busca os dados da coleção "stores" do Firestore e retorna um snapshot com os documentos encontrados
      const allPoints = snapshot.docs.map((doc) => {
        const data = doc.data(); //
        return {
          id: doc.id,
          name: data.name,
          lat: data.lat,
          lng: data.lng,
          type: data.type,
        };
      });
      const visiblePoints =
        role === "supervisor"
          ? allPoints.filter((p) => p.type === "dc" || storeIds.includes(p.id))
          : allPoints; //Se o usuário for supervisor, aplicará o filtro
      setPoints(visiblePoints); // setPoints atualiza o estado points com a lista de pontos carregados do Firestore, o que fará com que o componente seja re-renderizado e os marcadores sejam exibidos no mapa
    }
    loadPoints();
  }, []); // O array vazio [] como segundo argumento do useEffect garante que a função seja executada apenas uma vez, quando o componente for montado.
  useEffect(() => {
    // useEffect para ajustar a região do mapa com base nos pontos carregados. Ele é executado sempre que a lista de pontos (points) é atualizada.
    if (points.length === 0) return;

    const coordinates = points.map((p) => ({
      latitude: p.lat,
      longitude: p.lng,
    }));

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated: true,
    });
  }, [points]); // fecha o segundo useEffect

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          // initialRegion define a região inicial do mapa quando ele é carregado pela primeira vez // sem o ref={mapRef}, mapRef.current fica null e você não consegue controlar o mapa.
          {
            latitude: -3.7300085,
            longitude: -38.5408318,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        }
      >
        {/* <Marker coordinate={{ //CD
        latitude: -3.7300085,
        longitude: -38.5408318
  }}/>
                                            // <Marker coordinate={{ //Ponto de teste antes de conectar com o firebase
        { <Marker coordinate={{ // Aldeota      
        latitude: -3.7388766,
        longitude: -38.4972233
  }}/> */}
        {points.map((p) => (
          <Marker
            key={p.id} // A propriedade key é importante para ajudar o React a identificar quais itens foram alterados, adicionados ou removidos.
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            title={p.name}
            pinColor={p.type === "dc" ? "blue" : "red"} // Exemplo de cor baseada no tipo. Modo alternativo de if else (operador ternário)
          />
        ))}
      </MapView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
