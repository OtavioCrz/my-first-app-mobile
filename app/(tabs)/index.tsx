import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "@/firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { BarChart } from "react-native-chart-kit";

export default function HomeScreen() {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null); //any pq ainda não sei o formato dos dados do usuário, e null pq inicialmente não tem dados carregados
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<any>({})

  useEffect(() => {
    async function loadData() {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", currentUserId));
      const userDataFromFirestore = userSnap.data() || {}; //.data transforma o snapshot em um objeto com os dados do usuário
      setUserData(userDataFromFirestore); //setUserData atualiza o estado do componente com os dados do usuário, o que faz com que o componente seja re-renderizado e mostre as informações do usuário na tela

      const routesSnap = await getDocs(collection(db, "routes"));
      const routesData = routesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoutes(routesData);

      const usersSnap = await getDocs(collection(db, "users"));
      const usersData: any = {}; //any pq ainda não sei o formato dos dados dos usuários
      usersSnap.forEach((doc) => {
        usersData[doc.id] = doc.data();
      });
      setUsersMap(usersData);

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="#5b00d3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <View>
          <View style={styles.routeContainer}>
            <Text> Olá, {userData?.name}</Text>
            <Pressable
              onPress={async () => {
              await signOut(auth);
              router.replace("/login");
            }}
          >
            <Text>Sair</Text>
          </Pressable>
        </View>

        <View style={styles.cardsContainer}>
          <View>
            <Text>{routes.length} Rotas</Text>
            <Text>Total</Text>
          </View>

          <View>
            <Text>
              {routes.filter((r) => r.status === "em_andamento").length} Rotas
            </Text>
            <Text>Em andamento</Text>
          </View>

          <View>
            <Text>
              {routes.filter((r) => r.status === "concluida").length} Rotas
            </Text>
            <Text>Concluídas</Text>
          </View>
        </View>

        <BarChart
          data={{
            labels: ["Pendente", "Em andamento", "Concluída"],
            datasets: [
              {
                data: [
                  routes.filter((r) => r.status === "pendente").length,
                  routes.filter((r) => r.status === "em_andamento").length,
                  routes.filter((r) => r.status === "concluida").length,
                ],
              },
            ],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#d85800",
            backgroundGradientFrom: "#d78700",
            backgroundGradientTo: "#d78700",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          yAxisLabel=""
          yAxisSuffix=""
        />

        <Text style={styles.titulo}>Rotas Recentes</Text>
        {routes.map((route) => (
          <View key={route.id}>
            <Text>Rota: {route.id}</Text>
            <Text>Status: {route.status}</Text>
            <Text>Usuário: {usersMap[route.motoristaId]?.name  || "Não Atribuido"}</Text>
            <Text>{(route.stops || []).filter((stop: any) => stop.status === "concluida").length || 0}
              /
              {route.stops?.length || 0} Paradas Concluídas</Text>
            

          </View>
        ))}
        
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  routeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },

  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  titulo:{
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 20,


  },
});
