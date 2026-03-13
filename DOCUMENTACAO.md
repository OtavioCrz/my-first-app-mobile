# Documentação do Projeto — Rastreamento MP (Maria Pitanga)

> Projeto de rastreamento de entregas desenvolvido como trabalho de faculdade,
> com objetivo futuro de ser implementado na empresa Maria Pitanga (Fortaleza - CE).
>
> **Aluno:** João Otávio
> **Stack:** React Native + Expo Router + Firebase (Auth + Firestore)

---

## Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Estrutura do Firebase](#2-estrutura-do-firebase)
3. [Roles de Usuário](#3-roles-de-usuário)
4. [Telas Implementadas](#4-telas-implementadas)
5. [Erros Cometidos e Correções](#5-erros-cometidos-e-correções)
6. [Dúvidas e Respostas](#6-dúvidas-e-respostas)
7. [Decisões de Arquitetura](#7-decisões-de-arquitetura)
8. [Bibliotecas Utilizadas](#8-bibliotecas-utilizadas)
9. [Histórico de Progresso](#9-histórico-de-progresso)

---

## 1. Visão Geral do Projeto

O app de Rastreamento MP tem como objetivo permitir que a logística da empresa
acompanhe em tempo real a localização dos caminhões de entrega e o status das rotas.

**Usuários do sistema:**
- **Logística** → vê tudo: todas as rotas, todos os caminhões, todos os pontos no mapa
- **Supervisor** → vê apenas as lojas que estão sob sua responsabilidade; assina digitalmente o recebimento das entregas
- **Motorista** → vê apenas suas rotas atribuídas; confirma entrega no app ao chegar na loja

**Funcionalidades planejadas para as entregas:**
- Cada parada terá um campo de **peso da carga** (ex: 2 toneladas)
- Gráfico de peso entregue filtrável por **dia, mês e ano**
- Fluxo de confirmação de recebimento:
  1. Motorista confirma chegada/entrega no app
  2. Supervisor confirma o recebimento
  3. Supervisor assina digitalmente (assinatura no app)
- Esses dados serão armazenados por parada na coleção `routes`

---

## 2. Estrutura do Firebase

### Coleção: `users`
Armazena os dados de cada usuário cadastrado. O ID do documento é o mesmo UID
gerado pelo Firebase Authentication — isso garante que ao buscar o usuário logado,
basta usar `auth.currentUser.uid` como ID do documento.

```
users/{uid}
  ├── active: boolean
  ├── createdAt: timestamp
  ├── email: string
  ├── name: string
  ├── phone: string
  ├── role: string  ("logistica" | "supervisor" | "motorista")
  └── storeIds: array<string>  (usado apenas para supervisores)
```

**Por que storeIds é array?** Um supervisor pode ser responsável por mais de uma loja.

---

### Coleção: `stores`
Armazena os pontos de entrega (lojas e centro de distribuição).

```
stores/{storeId}
  ├── active: boolean
  ├── address: string
  ├── city: string
  ├── lat: number
  ├── lng: number
  ├── name: string
  └── type: string  ("store" | "dc")
```

**Por que o tipo "dc"?** DC = Centro de Distribuição. É o ponto de origem das entregas,
e no mapa aparece com cor azul para diferenciar das lojas (vermelho).

**Lojas cadastradas:** aeroporto, aldeota, castelão, cd_fortaleza, iguatemi,
lago_jacarey, patio_messejana.

---

### Coleção: `trucks`
Armazena os caminhões da frota.

```
trucks/{truckId}
  ├── modelo: string
  ├── placa: string
  └── motoristId: string  (UID do motorista vinculado)
```

**Trucks cadastrados:**
| ID | Modelo | Placa | Motorista |
|---|---|---|---|
| UNqf61nDh1HbFyI55lEu | VW Delivery | ABC-1D23 | Motorista Teste 1 |
| JOKO1L6ejT6qo4jXfyEF | Accelo 817 | JUJ-6A77 | Motorista Teste 3 |
| Y2aHU9kgpaSYWAEsXOSV | XX Delivery | ABC-5E67 | Motorista Teste 2 |

---

### Coleção: `routes`
Armazena as rotas de entrega. Cada rota tem um array de `stops` (paradas).

```
routes/{routeId}
  ├── truckId: string
  ├── motoristId: string
  ├── status: string  ("pendente" | "em_andamento" | "concluida")
  ├── createdAt: timestamp
  ├── startedIn: timestamp | null
  ├── completedIn: timestamp | null
  └── stops: array
        └── [{
              order: number,
              storeId: string,
              status: string  ("pendente" | "em andamento" | "concluida")
            }]
```

**Por que cada stop tem seu próprio status?** Porque uma rota pode estar "em andamento"
enquanto a primeira parada já foi "concluida" e as próximas ainda estão "pendente".
Isso permite rastrear o progresso parada por parada.

**Rotas cadastradas para teste:**
| ID | Status | Stops |
|---|---|---|
| UW7G7YiMmPxSmMS0GvLy | pendente | aeroporto → aldeota → iguatemi |
| WNEdkSSzMU1dqbCueoVL | em_andamento | castelão → lago_jacarey → iguatemi |
| z2RgOZww0LIVeGcw4s2h | concluida | aldeota → lago_jacarey → patio_messejana |

---

### Coleção: `locations`
Armazena a última localização GPS de cada caminhão (atualizada em tempo real).

```
locations/{truckId}
  ├── lat: number
  ├── lng: number
  └── updatedIn: timestamp
```

**Por que o ID do documento é o truckId?** Para facilitar a busca: em vez de procurar
dentro de uma lista, basta acessar diretamente `locations/{truckId}`.

---

## 3. Roles de Usuário

| Role | Acesso no Mapa | Acesso ao Dashboard |
|---|---|---|
| `logistica` | Vê todos os pontos | Vê todas as rotas e trucks |
| `supervisor` | Vê apenas DC + suas lojas (storeIds) | Vê rotas das suas lojas |
| `motorista` | (a definir) | Vê apenas suas rotas |

**Usuários de teste:**
| Email | Role | Observação |
|---|---|---|
| oms.otavio@gmail.com | logistica | Usuário principal (João Otávio) |
| testeloja@teste.com | supervisor | storeIds: [aldeota] |
| testemotorista@teste.com | motorista | Motorista Teste 1 |
| testemotorista2@teste.com | motorista | Motorista Teste 2 |
| testemotorista3@gmail.com | motorista | Motorista Teste 3 |

---

## 4. Telas Implementadas

### ✅ Login (`app/login.tsx`)
- Autenticação com email e senha via Firebase Auth
- Validação de campos (email inválido, campos vazios)
- Botão de mostrar/esconder senha
- Link "Esqueci minha senha" (navega para `/reset-password`)
- Tratamento de erros do Firebase (senha incorreta, email não encontrado)
- Loading durante o processo de login

### ✅ Mapa (`app/(tabs)/map.tsx`)
- Exibe pontos no mapa usando `react-native-maps`
- Carrega dados da coleção `stores` do Firestore
- Lógica de role-based access:
  - `supervisor` → vê apenas pontos com `type === "dc"` + suas `storeIds`
  - outros roles → vê todos os pontos
- Marcadores com cores diferentes: azul (DC) e vermelho (loja)
- `fitToCoordinates` para ajustar o zoom automaticamente

### 🚧 Home/Dashboard (`app/(tabs)/index.tsx`)
- Em construção — será o dashboard com cards e gráficos

#### Progresso atual da construção do Dashboard

**Step 1 ✅ — Estrutura base do componente**
- Componente `HomeScreen` com `SafeAreaView`, `View` e `Text` básicos

**Step 2 ✅ — Estados com `useState`**
- `userData` (`useState<any>(null)`) → dados do usuário logado (name, role, etc.)
- `routes` (`useState<any[]>([])`) → lista de rotas buscada do Firestore
- `loading` (`useState(true)`) → controla se está carregando

Por que `<any>` e `<any[]>`? TypeScript infere o tipo pelo valor inicial. `useState(null)` vira `null` apenas; `useState([])` vira `never[]`. O `<any>` diz ao TypeScript: "aceita qualquer tipo aqui".

**Step 3 ✅ — Busca de dados com `useEffect`**
- `useEffect` com array vazio `[]` executa uma única vez quando o componente monta
- Função `async loadData()` interna (useEffect não pode ser async diretamente — retornaria Promise em vez de undefined/cleanup)
- Busca dados do usuário com `getDoc(doc(db, "users", uid))`
- Busca todas as rotas com `getDocs(collection(db, "routes"))`
- Ao final, seta `loading(false)`

**Step 4 ✅ — Loading state com `ActivityIndicator`**
- `if (loading) return (<spinner>)` antes do return principal
- Enquanto `loading === true`, mostra `ActivityIndicator` centralizado
- Quando os dados chegam, `setLoading(false)` e o componente re-renderiza com o conteúdo

**Step 5 ✅ — Header com saudação e botão de logout**
- `View` com `flexDirection: "row"` e `justifyContent: "space-between"`
- `Text` com `Olá, {userData?.name}`
- `Pressable` com `async onPress` → `await signOut(auth)` + `router.replace("/login")`
- `signOut` precisa ser awaited antes de navegar (é assíncrono)

**Step 6 ✅ — Cards de resumo (Total, Em Andamento, Concluídas)**
- 3 `View`s lado a lado com `flexDirection: "row"` e `justifyContent: "space-around"`
- Total: `routes.length`
- Em andamento: `routes.filter((r) => r.status === "em_andamento").length`
- Concluídas: `routes.filter((r) => r.status === "concluida").length`
- `.filter()` cria um novo array com apenas os itens que passam na condição

**Step 7 ✅ — Gráfico de barras com `react-native-chart-kit`**
- Componente `BarChart` com props: `data`, `width`, `height`, `chartConfig`
- `Dimensions.get("window").width` para pegar a largura da tela
- Cores personalizadas em laranja (identidade Maria Pitanga): `#d85800` / `#d78700`
- `decimalPlaces: 0` para mostrar números inteiros
- Componentes sem filhos fecham com `/>` (self-closing)

**Step 8 ✅ — Lista de rotas recentes**
- `.map()` no array `routes` para renderizar cada rota
- `key={route.id}` obrigatório em listas (React precisa identificar cada item)
- Mostra ID e status de cada rota
- `ScrollView` adicionado para permitir rolagem quando conteúdo ultrapassa a tela

**Step 9 ✅ — Melhorar lista de rotas com nome do motorista**
- `usersMap` populado dentro do `loadData` com `getDocs(collection(db, "users"))`
- `forEach` usado para construir o objeto `{ uid: dadosDoUsuario }` (diferente do `.map()` — não retorna array, só executa ação)
- No JSX: `usersMap[route.motoristaId]?.name || "Não Atribuído"` para exibir nome com fallback
- Erro cometido: campo nomeado `userId` e depois `motoristaId` errado antes de descobrir o nome correto no Firebase (`motoristaId`)
- Lição: sempre verificar o nome exato do campo no Firebase antes de usar no código

**Step 10 ✅ — Contagem de paradas por rota**
- `(route.stops || []).filter((stop: any) => stop.status === "concluida").length` para contar paradas concluídas
- `(route.stops || [])` em vez de `route.stops?.` — garante array mesmo se `stops` for undefined, e permite TypeScript inferir o tipo do callback
- `(stop: any)` — tipo explícito necessário quando TypeScript não consegue inferir em callbacks de arrays com tipo `any`
- Erros cometidos: `useState` usado no lugar de tipagem de variável; lógica invertida com `!==`; `&& "em_andamento"` solto sem comparação; acento em `"concluída"`
- Lição: quando quiser filtrar por um valor específico, use `=== "valor"` direto — é sempre mais simples e legível que negar os outros valores

**Steps futuros:**
- Filtros por status, motorista ou data
- Tela de detalhes da rota (ao clicar numa rota)
- Rastreamento em tempo real (coleção `locations`)
- Ações: criar rotas, atribuir motoristas
- Peso por entrega + gráfico filtrado por dia/mês/ano
- Confirmação de recebimento pelo motorista + supervisor
- Assinatura digital do supervisor no recebimento
- Firestore Security Rules para produção

---

## 5. Erros Cometidos e Correções

### Erro 1 — Campo `status` da rota como Array ao invés de String
**O que aconteceu:** Ao criar as rotas no Firebase, o campo `status` foi criado
como tipo "array" com os valores ["pendente", "concluida", "em andamento"].

**Por que é um problema:** O código vai fazer comparações como `status === "concluida"`.
Se `status` for um array, essa comparação nunca será verdadeira e o app não vai
funcionar corretamente.

**Correção:** Deletar o campo array e recriar como tipo "string" com um único valor.

---

### Erro 2 — Campo `completedIn` preenchido em rota com `status: "pendente"`
**O que aconteceu:** A rota UW7G7... tinha `completedIn` com uma data, mas o status
era "pendente". Isso é semanticamente contraditório.

**Regra:** `completedIn` só deve ter valor quando `status === "concluida"`.
Para `pendente` e `em andamento`, deve ser `null`.

**Correção:** Alterar `completedIn` para `null` na rota pendente.

---

### Erro 3 — Campo `store` ao invés de `storeId` em um stop
**O que aconteceu:** Em um stop da rota WNEdkS..., o campo foi nomeado `store`
em vez de `storeId`.

**Por que é um problema:** O código vai buscar `stop.storeId`. Se o campo se chamar
`stop.store`, o valor virá como `undefined`.

**Correção:** Deletar o campo `store` e recriar como `storeId`.

---

### Erro 4 — Acento em valor de string (`"concluída"` vs `"concluida"`)
**O que aconteceu:** Um stop tinha `status: "concluída"` (com acento no "i"),
enquanto o padrão adotado é `"concluida"` (sem acento).

**Por que é um problema:** Comparações de string são case-sensitive e acento-sensitive.
`"concluída" === "concluida"` retorna `false`.

**Correção:** Alterar para `"concluida"` sem acento. Sempre usar o mesmo padrão.

---

### Erro 5 — `import react` com letra minúscula
**O que aconteceu:** O import foi escrito como `import react` ao invés de `import React`.
**Por que é um problema:** JavaScript diferencia maiúsculas de minúsculas. O módulo exporta `React` com R maiúsculo.
**Correção:** Usar `import React from 'react'`.

---

### Erro 6 — `React.useState` enquanto `useState` já estava importado
**O que aconteceu:** O aluno usou `React.useState(...)` mas já tinha `import { useState } from "react"` no topo.
**Por que é um problema:** Não é um erro que quebra o app, mas é redundante e inconsistente.
**Correção:** Usar `useState(...)` diretamente.

---

### Erro 7 — Variáveis comuns (`let`/`const`) em vez de `useState` para estado
**O que aconteceu:** `const routes = []` e `let loading = true` foram usados como variáveis normais.
**Por que é um problema:** Variáveis normais **não** causam re-render. O React não sabe que mudaram e a tela não atualiza.
**Correção:** Usar `useState` para qualquer dado que, ao mudar, deve atualizar a tela.

---

### Erro 8 — Estados separados (`name` e `role`) em vez de objeto único (`userData`)
**O que aconteceu:** Foram criados `useState` separados para `name` e `role`.
**Por que é um problema:** Se o dado vem junto do Firestore (um objeto com name, role, email...), faz mais sentido guardar tudo num único estado.
**Correção:** Um único `const [userData, setUserData] = useState<any>(null)`.

---

### Erro 9 — `"em andamento"` com espaço vs `"em_andamento"` com underscore
**O que aconteceu:** No Firebase o status estava salvo como `"em andamento"` (com espaço), mas no código foi usado `"em_andamento"` (com underscore).
**Por que é um problema:** Comparação exata de strings — `"em andamento" !== "em_andamento"`.
**Correção:** Padronizou no Firebase para `"em_andamento"` com underscore e ajustou o código.

---

### Erro 10 — `"concluída"` com acento voltou a aparecer
**O que aconteceu:** Mesmo após a correção do Erro 4, uma rota ainda tinha `"concluída"` com acento no Firebase.
**Correção:** Verificou e corrigiu no Firebase para `"concluida"` sem acento.

---

## 6. Dúvidas e Respostas

### Por que o ID do documento em `users` é igual ao UID do Authentication?
Quando um usuário faz login, o Firebase Auth gera um `uid` único para ele.
Se usarmos esse mesmo `uid` como ID do documento no Firestore, podemos buscar
os dados do usuário logado facilmente com:
```typescript
const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
```
Se usássemos IDs diferentes, precisaríamos fazer uma query para encontrar o documento,
o que é mais lento e complexo.

---

### Como funciona o `useState`?
O `useState` retorna um par: `[valor, funcaoParaAlterar]`.
- `userData` → o valor atual do estado (começa `null`)
- `setUserData` → a função que muda o valor e dispara um re-render

Quando chamamos `setUserData(dados)`, duas coisas acontecem:
1. O valor de `userData` muda de `null` para o objeto com os dados
2. O React re-renderiza o componente, e `{userData?.name}` agora mostra o nome

Analogia: `setUserData` é um controle remoto, `userData` é a TV. Apertar o botão (chamar a função) muda o que aparece na tela.

---

### Por que o `useEffect` não pode ser `async`?
O React espera que o `useEffect` retorne `undefined` ou uma função de limpeza (cleanup).
Uma função `async` retorna uma `Promise`, o que quebraria o comportamento.
Solução: criar uma função `async` **dentro** do useEffect e chamá-la.

---

### O que é o `<any>` no `useState<any>(null)`?
É um **generic** do TypeScript. O TypeScript infere o tipo pelo valor inicial:
- `useState(null)` → tipo inferido: `null` (nunca pode ser outra coisa)
- `useState([])` → tipo inferido: `never[]` (array que nunca pode ter nada)

Com `<any>`, dizemos: "aceita qualquer tipo". É temporário até definirmos tipos próprios.

---

### O que é um Lookup Map (mapa de busca)?
Um objeto onde a chave é um ID e o valor é o dado que queremos:
```
{ "uid123": "João", "uid456": "Carlos" }
```
Útil quando temos um ID (como `motoristId`) e queremos o nome rapidamente, sem precisar buscar no Firebase novamente.

---

### Por que usar `useRef` no MapView?
O `useRef` guarda uma referência ao componente `MapView` para podermos chamar
métodos nele diretamente, como o `fitToCoordinates()` (que ajusta o zoom para
mostrar todos os marcadores). Sem o `ref`, não teríamos como controlar o mapa
programaticamente.

---

## 7. Decisões de Arquitetura

### Expo Router (file-based routing)
Escolhemos Expo Router porque ele usa o sistema de arquivos como roteador:
cada arquivo em `app/` vira automaticamente uma rota. É similar ao Next.js.
Isso simplifica a navegação e segue as melhores práticas modernas do Expo.

### Firebase como Backend
Por ser um projeto estudantil e o plano Spark (gratuito) atender às necessidades,
Firebase foi a escolha natural. Oferece Auth + banco de dados + tempo real sem
precisar configurar um servidor backend.

### Lógica de roles no frontend vs backend
Atualmente, a lógica de "quem vê o quê" está no frontend (ex: `map.tsx`).
Para um projeto em produção real, as **Firestore Security Rules** no backend
também deveriam reforçar essas restrições. Isso será implementado futuramente.

---

## 8. Bibliotecas Utilizadas

| Biblioteca | Versão | Para que serve |
|---|---|---|
| expo | ~54.0.33 | Framework base |
| expo-router | ~6.0.23 | Navegação file-based |
| firebase | ^12.10.0 | Auth + Firestore |
| react-native-maps | 1.20.1 | Mapa interativo |
| expo-location | ~19.0.8 | GPS do dispositivo |
| expo-linear-gradient | ~15.0.8 | Gradientes visuais |
| react-native-svg | (expo install) | Renderização SVG (necessário para gráficos) |
| react-native-chart-kit | npm install | Gráficos (bar chart, pie chart, etc.) |

---

## 9. Histórico de Progresso

| Data | O que foi feito |
|---|---|
| Mar/2026 | Configuração inicial do projeto Expo |
| Mar/2026 | Implementação da tela de login com Firebase Auth |
| Mar/2026 | Implementação da tela de mapa com role-based access |
| Mar/2026 | Configuração das coleções no Firestore (locations, routes, stores, trucks, users) |
| Mar/2026 | População de dados de teste no Firebase |
| Mar/2026 | Correção de erros nos dados do Firestore (status array, completedIn, storeId) |
| Mar/2026 | Instalação de react-native-svg e react-native-chart-kit |
| Mar/2026 | Iniciando construção do Dashboard (Home) |
| Mar/2026 | Dashboard Step 1-4: estrutura base, useState, useEffect com Firebase, ActivityIndicator |
| Mar/2026 | Dashboard Step 5: Header com saudação e logout (signOut + router.replace) |
| Mar/2026 | Dashboard Step 6: Cards de resumo com .filter().length |
| Mar/2026 | Dashboard Step 7: BarChart com react-native-chart-kit (cores laranja Maria Pitanga) |
| Mar/2026 | Dashboard Step 8: Lista de rotas com .map() + ScrollView |
| Mar/2026 | Padronização Firebase: "em andamento" → "em_andamento", "concluída" → "concluida" |
| Mar/2026 | Dashboard Step 9: usersMap completo — nomes dos motoristas exibidos na lista de rotas |
| Mar/2026 | Dashboard Step 10: Contagem de paradas concluídas/total por rota |

---

*Documentação mantida durante o desenvolvimento do projeto.*
