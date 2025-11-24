#set document(title: "Konteneryzacja aplikacji Okane")
#set page(
  paper: "a4",
  margin: (left: 3.5cm, top: 2.5cm, right: 2.5cm, bottom: 2.5cm),
  footer: context align(center)[#counter(page).display("1")]
)
#set text(font: "Times New Roman", size: 12pt, lang: "pl")
#set par(justify: true, leading: 6pt)

#stack(
  dir: ltr,
  image("assets/logo_pk.png", width: 8cm),
  align(right)[
    #v(1em)
    #text(size: 1.1em)[
      24 listopada 2025 \
      Grupa P3
    ]
  ]
)

#v(2em)

#align(center)[
  #text(size: 1.8em)[Konteneryzacja aplikacji finansowej Okane z wykorzystaniem Minikube, Kubernetes oraz Podman] 
  
  #text(size: 1.2em)[Systemy Gridowe i Obliczenia w Chmurze]
]

#v(1fr) 

#align(center)[
  #text(size: 1.2em)[Kacper Kosmal, Marcin Klimek]
]

#pagebreak()

#set heading(numbering: "1.")

= Wstęp

== Cel projektu i zakres pracy

Celem niniejszego projektu była konteneryzacja aplikacji Okane - systemu do zarządzania finansami osobistymi - oraz jej wdrożenie w środowisku lokalnym Kubernetes przy użyciu Minikube. Zakres pracy obejmował przygotowanie obrazów kontenerowych dla poszczególnych komponentów aplikacji, skonfigurowanie klastra Kubernetes, stworzenie manifestów zasobów oraz przeprowadzenie testowego wdrożenia w środowisku lokalnym.

== Krótki opis aplikacji Okane

Okane to aplikacja webowa do zarządzania finansami osobistymi, składająca się z backendu napisanego w NestJS, frontendu opartego na Next.js, bazy danych PostgreSQL oraz cache'u Redis wykorzystywanego do kolejek zadań BullMQ. Aplikacja umożliwia użytkownikom śledzenie wydatków, zarządzanie budżetem oraz generowanie raportów finansowych z wykorzystaniem sztucznej inteligencji.

== Uzasadnienie wyboru technologii konteneryzacyjnych

Do konteneryzacji aplikacji wybrano Podman jako alternatywę dla Dockera ze względu na architekturę bezdemonową (daemonless), która zwiększa bezpieczeństwo i umożliwia uruchamianie kontenerów bez uprawnień administratora (rootless). Minikube posłużył jako lokalne środowisko Kubernetes, umożliwiające testowanie orkiestracji kontenerów przed wdrożeniem produkcyjnym. Kubernetes wybrano jako platformę orkiestracyjną ze względu na jej rozbudowane możliwości zarządzania kontenerami, skalowania aplikacji oraz zapewnienia wysokiej dostępności. Kustomize wykorzystano do deklaratywnego zarządzania konfiguracją Kubernetes, co pozwala na łatwe zarządzanie różnymi środowiskami (development, production) bez duplikacji manifestów.

== Struktura dokumentu

Dokument składa się z siedmiu głównych sekcji. Po wstępie następuje przegląd wykorzystanych technologii, opisujący cechy i zastosowania Podman, Minikube, Kubernetes oraz Kustomize. Kolejne sekcje opisują architekturę aplikacji, proces konteneryzacji z wykorzystaniem multi-stage builds, szczegółową konfigurację Kubernetes oraz napotkane problemy wraz z ich rozwiązaniami. Dokument kończy się podsumowaniem osiągniętych celów i bibliografią.

= Przegląd wykorzystanych technologii

== Podman

Podman to nowoczesne narzędzie do zarządzania kontenerami, stanowiące alternatywę dla Dockera. Jego kluczową cechą jest architektura bezdemonowa (daemonless), co oznacza, że nie wymaga działającego w tle procesu zarządzającego kontenerami. Każdy kontener jest uruchamiany jako osobny proces bezpośrednio przez narzędzie podman, co eliminuje pojedynczy punkt awarii i upraszcza architekturę systemu.

Podman wspiera koncepcję rootless containers, umożliwiając uruchamianie kontenerów bez uprawnień administratora. Zwiększa to bezpieczeństwo systemu, ponieważ potencjalne naruszenie bezpieczeństwa kontenera nie daje atakującemu dostępu do uprawnień root na hoście. Kontener działa w przestrzeni użytkownika z mapowaniem UID/GID, co izoluje go od zasobów systemowych.

Podman jest w pełni kompatybilny z formatem obrazów OCI (Open Container Initiative) oraz integruje się z Kubernetes poprzez CRI-O - implementację Container Runtime Interface. Dzięki temu obrazy budowane w Podmanie mogą być bezproblemowo używane w klastrach Kubernetes, a Minikube może wykorzystywać Podman jako driver do uruchamiania węzłów klastra.

== Minikube

Minikube to narzędzie służące do uruchamiania lokalnego klastra Kubernetes, przeznaczone głównie do celów rozwojowych i testowych. Umożliwia ono programistom eksperymentowanie z Kubernetes na własnym komputerze bez potrzeby dostępu do chmury obliczeniowej czy dedykowanej infrastruktury.

W projekcie Okane Minikube został skonfigurowany z parametrami `driver=podman` oraz `container-runtime=cri-o`, co oznacza, że wykorzystuje Podman jako backend do uruchamiania węzłów klastra oraz CRI-O jako runtime kontenerowy wewnątrz klastra. Taka konfiguracja zapewnia spójność narzędzi na całej ścieżce od budowania obrazów po ich uruchamianie w klastrze.

Minikube obsługuje system addonów, które rozszerzają funkcjonalność klastra. W projekcie wykorzystano addony `ingress` (Nginx Ingress Controller do zarządzania ruchem HTTP/HTTPS) oraz `metrics-server` (zbieranie metryk wydajności węzłów i podów). Addony te są instalowane jedną komendą i automatycznie konfigurowane w klastrze.

== Kubernetes

Kubernetes to platforma open-source do orkiestracji kontenerów, pierwotnie stworzona przez Google. Automatyzuje ona wdrażanie, skalowanie i zarządzanie aplikacjami kontenerowymi, zapewniając wysoki poziom abstrakcji nad infrastrukturą.

Podstawowe koncepty Kubernetes wykorzystane w projekcie to:

- *Pods* - najmniejsza jednostka wdrożeniowa, zawierająca jeden lub więcej kontenerów działających razem. Każdy pod posiada własny adres IP i współdzieli przestrzeń sieciową między kontenerami.

- *Deployments* - kontroler zarządzający replikami podów, zapewniający deklaratywne aktualizacje aplikacji oraz możliwość łatwego rollbacku w przypadku problemów.

- *Services* - abstrakcja zapewniająca stałą nazwę DNS i adres IP dla zestawu podów, umożliwiająca wewnętrzną komunikację między komponentami aplikacji niezależnie od tego, które konkretne instancje podów aktualnie działają.

- *StatefulSets* - kontroler podobny do Deployment, ale przeznaczony dla aplikacji stanowych (np. baz danych), zapewniający stałe identyfikatory podów oraz uporządkowane wdrażanie i skalowanie.

- *Namespaces* - mechanizm logicznej izolacji zasobów w klastrze, pozwalający na organizację komponentów i kontrolę dostępu. W projekcie wszystkie zasoby aplikacji Okane umieszczono w dedykowanym namespace `okane`.

== Kustomize

Kustomize to narzędzie do deklaratywnego zarządzania konfiguracją Kubernetes, zintegrowane z kubectl od wersji 1.14. Umożliwia ono dostosowywanie manifestów YAML bez ich bezpośredniej modyfikacji, zamiast tego stosując nakładki (overlays) i transformacje.

Kluczową koncepcją Kustomize jest podział konfiguracji na bazową (base) oraz środowiskowe overlays. Konfiguracja bazowa zawiera wspólne definicje zasobów, które są następnie dostosowywane dla konkretnych środowisk (development, staging, production) poprzez overlays. To podejście eliminuje duplikację manifestów i ułatwia zarządzanie różnicami między środowiskami.

W projekcie Okane katalog `k8s/base` zawiera podstawowe definicje wszystkich zasobów, a `k8s/overlays/prod` nadpisuje tagi obrazów kontenerowych oraz inne parametry specyficzne dla środowiska produkcyjnego. Kustomize automatycznie łączy te konfiguracje podczas wdrożenia, generując kompletne manifesty Kubernetes.

= Architektura aplikacji

#figure(
  rect(width: 100%, height: 12cm, stroke: 1pt + black, fill: rgb("#f0f0f0"))[
    #align(center + horizon)[
      #text(size: 14pt)[DIAGRAM 1: Architektura systemu - komponenty i ich relacje]
    ]
  ],
  caption: [Architektura systemu - komponenty i ich relacje]
)

Aplikacja Okane składa się z czterech głównych komponentów wdrożonych jako oddzielne zasoby Kubernetes:

*Backend (main)* - serwis API zbudowany w NestJS, odpowiedzialny za logikę biznesową aplikacji, autoryzację użytkowników, zarządzanie danymi finansowymi oraz integrację z OpenAI do generowania raportów. Backend nasłuchuje na porcie 4321 i komunikuje się z bazą danych PostgreSQL oraz Redis.

*Frontend (web)* - interfejs użytkownika zbudowany w Next.js, renderowany po stronie serwera (SSR). Aplikacja Next.js działa na porcie 3000 i komunikuje się z backendem poprzez API. Frontend jest skonfigurowany w trybie standalone, co minimalizuje rozmiar obrazu kontenerowego.

*PostgreSQL* - relacyjna baza danych przechowująca dane użytkowników, transakcje finansowe, kategorie wydatków oraz historię operacji. Wdrożona jako StatefulSet z persistentnym wolumenem zapewniającym trwałość danych. Używana jest wersja PostgreSQL 9.6.

*Redis* - baza danych in-memory wykorzystywana jako cache oraz do zarządzania kolejkami zadań BullMQ. Backend wykorzystuje Redis do asynchronicznego przetwarzania zadań takich jak generowanie raportów AI. Redis wdrożony jest jako Deployment, ponieważ nie wymaga persystencji danych.

Wszystkie komponenty umieszczone są w dedykowanym namespace `okane`, co zapewnia logiczną izolację zasobów oraz ułatwia zarządzanie cyklem życia aplikacji.

== Komunikacja

Ingress Nginx pełni rolę punktu wejścia do klastra, zarządzając ruchem HTTP pochodzącym z zewnątrz. Obsługuje routing oparty na nazwach hostów, kierując żądania do odpowiednich serwisów.

Routing skonfigurowano w następujący sposób:

- `web.okane.local` #sym.arrow frontend (Next.js) przez Service `web` na porcie 80
- `api.okane.local` #sym.arrow backend (NestJS) przez Service `main` na porcie 80

Wewnętrzna komunikacja między komponentami odbywa się przez Services typu ClusterIP. Backend łączy się z PostgreSQL poprzez Service `postgres` (port 5432) oraz z Redis przez Service `redis` (port 6379). Frontend komunikuje się z backendem używając publicznego URL `http://api.okane.local/`, który jest rozwiązywany przez Ingress.

Services w Kubernetes zapewniają discovery poprzez DNS - każdy serwis jest dostępny pod nazwą `<service-name>.<namespace>.svc.cluster.local`, co umożliwia komunikację między podami bez znajomości ich dynamicznych adresów IP.

= Konteneryzacja aplikacji

== Multi-stage builds - optymalizacja rozmiaru obrazów

Multi-stage builds to technika budowania obrazów kontenerowych polegająca na wykorzystaniu wielu etapów (stages) w jednym Dockerfile. Każdy etap może bazować na innym obrazie bazowym i służyć konkretnemu celowi (instalacja zależności, kompilacja kodu, przygotowanie środowiska runtime). Finalny obraz zawiera tylko niezbędne artefakty z poprzednich etapów, co drastycznie redukuje jego rozmiar.

Główne korzyści multi-stage builds:

- Znacząca redukcja rozmiaru finalnego obrazu poprzez usunięcie narzędzi build-time
- Zwiększenie bezpieczeństwa przez eliminację potencjalnych podatności w narzędziach deweloperskich
- Lepsze cache'owanie warstw, przyspieszające kolejne buildy
- Separacja concerns - jasny podział na etapy instalacji, budowania i runtime

== Backend (main) - listing fragmentu Dockerfile

#figure(
```dockerfile
FROM node:20 AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
RUN mkdir -p packages/main
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/main/package.json packages/main/pnpm-lock.yaml packages/main/
RUN pnpm install --frozen-lockfile --filter @okane/main...

FROM dependencies AS build
COPY tsconfig.base.json tsconfig.json ./
COPY packages/main packages/main
RUN pnpm deploy --filter @okane/main /app/deploy
WORKDIR /app/deploy
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4321
RUN apk add --no-cache curl
COPY --from=build /app/deploy ./
EXPOSE 4321
CMD ["node", "dist/src/main"]
```,
  caption: [Dockerfile backendu - multi-stage build]
)

Proces budowania backendu składa się z czterech etapów:

*Stage 1: base* - Bazuje na obrazie Node.js 20 i konfiguruje menedżer paczek pnpm poprzez corepack. Ten etap służy jako fundament dla kolejnych stage'ów instalacji i budowania.

*Stage 2: dependencies* - Kopiuje pliki definicji zależności (package.json, pnpm-lock.yaml) i instaluje wszystkie wymagane paczki używając `--frozen-lockfile`, co gwarantuje instalację dokładnie tych samych wersji zależności co w środowisku developerskim. Flaga `--filter @okane/main...` zapewnia instalację zależności tylko dla pakietu backend, co przyspiesza proces w monorepo.

*Stage 3: build* - Kopiuje kod źródłowy TypeScript i kompiluje go do JavaScript. Używa `pnpm deploy` do przygotowania standalone instalacji pakietu z wszystkimi zależnościami produkcyjnymi, co upraszcza kolejny etap.

*Stage 4: runner* - Finalny etap bazuje na lekkim obrazie Alpine Linux (node:20-alpine), który jest znacznie mniejszy od standardowego obrazu Debian. Kopiuje tylko skompilowany kod i zależności produkcyjne z etapu build. Instaluje curl dla health checków Kubernetes. Obraz uruchamia się z ustawionym NODE_ENV=production, co optymalizuje wydajność Node.js.

*Wynik*: Dzięki multi-stage builds finalny obraz backendu ma rozmiar [PLACEHOLDER: ~XXX MB], w porównaniu do [PLACEHOLDER: ~XXX MB] bez użycia tej techniki - redukcja o około [PLACEHOLDER: XX%]. _Uwaga: wartości są placeholderowe i wymagają uzupełnienia po rzeczywistym buildzie._

== Frontend (web) - podobna struktura

#figure(
```dockerfile
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS dependencies
RUN mkdir -p packages/web
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/web/package.json packages/web/pnpm-lock.yaml packages/web/
RUN pnpm install --frozen-lockfile --filter @okane/web...

FROM dependencies AS build
COPY tsconfig.base.json tsconfig.json ./
COPY packages/web packages/web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @okane/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache curl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=build /app/packages/web/.next/standalone ./
COPY --from=build /app/packages/web/.next/static ./.next/static
COPY --from=build /app/packages/web/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```,
  caption: [Dockerfile frontendu - multi-stage build]
)

Frontend wykorzystuje podobny proces budowania z następującymi specyfikami:

*Build-time ARG dla NEXT_PUBLIC_API_URL* - Next.js wymaga, aby zmienne środowiskowe z prefiksem `NEXT_PUBLIC_` były dostępne podczas budowania (build-time), ponieważ są wbudowywane w kod JavaScript przesyłany do przeglądarki. Dockerfile wykorzystuje mechanizm ARG do przekazania URL API podczas budowania obrazu: `docker build --build-arg NEXT_PUBLIC_API_URL=http://api.okane.local/`.

*Next.js standalone output* - Next.js w wersji 12+ oferuje tryb standalone, który generuje minimalną, samodzielną wersję aplikacji zawierającą tylko niezbędne zależności. W przeciwieństwie do standardowego buildu, który kopiuje całe node_modules, standalone output zawiera tylko wykorzystywane zależności, co znacząco redukuje rozmiar obrazu. Konfiguracja w next.config.js: `output: 'standalone'`.

*User nextjs (non-root) dla bezpieczeństwa* - Zgodnie z best practices bezpieczeństwa kontenerów, aplikacja nie powinna działać jako root. Dockerfile tworzy dedykowanego użytkownika systemowego `nextjs` (UID 1001) i grupę `nodejs` (GID 1001), a następnie przełącza kontekst wykonania na tego użytkownika przed uruchomieniem aplikacji.

*Tylko niezbędne pliki* - Z etapu build kopiowane są tylko trzy elementy: `.next/standalone` (serwer i kod aplikacji), `.next/static` (statyczne assety jak CSS, JS) oraz `public` (publiczne zasoby jak obrazy). Cały kod źródłowy TypeScript oraz node_modules pozostają w poprzednich etapach i nie trafiają do finalnego obrazu.

*Wynik*: Finalny obraz frontendu ma rozmiar [PLACEHOLDER: ~XXX MB], w porównaniu do [PLACEHOLDER: ~XXX MB] bez multi-stage builds - redukcja o około [PLACEHOLDER: XX%]. _Uwaga: wartości są placeholderowe i wymagają uzupełnienia po rzeczywistym buildzie._

#figure(
  rect(width: 100%, height: 10cm, stroke: 1pt + black, fill: rgb("#f0f0f0"))[
    #align(center + horizon)[
      #text(size: 14pt)[DIAGRAM 2: Proces budowania obrazów - wizualizacja multi-stage builds]
    ]
  ],
  caption: [Proces budowania obrazów - wizualizacja multi-stage builds]
)

== Budowanie w Minikube

Minikube oferuje komendę `image build`, która buduje obrazy kontenerowe bezpośrednio w środowisku klastra. Dzięki temu nie ma potrzeby pushowania obrazów do zewnętrznego registry - są one dostępne lokalnie w węźle Minikube.

```bash
minikube image build -t main:prod -f packages/main/Dockerfile .
minikube image build -t web:prod -f packages/web/Dockerfile .
```

Komendy te muszą być wykonane z poziomu głównego katalogu projektu (workspace root), ponieważ Dockerfile'y wykorzystują strukturę monorepo i wymagają dostępu do plików wspólnych (tsconfig.base.json, pnpm-workspace.yaml). Flaga `-t` określa tag obrazu, który będzie używany w manifestach Kubernetes. Flaga `-f` wskazuje ścieżkę do Dockerfile, a `.` określa kontekst budowania.

Po zbudowaniu obrazy są dostępne w wewnętrznym registry Minikube i mogą być używane przez pody z `imagePullPolicy: IfNotPresent`, co instruuje Kubernetes, aby najpierw sprawdził lokalne obrazy przed próbą pobrania z zewnętrznego registry.

= Konfiguracja Kubernetes

== Struktura katalogów

Manifesty Kubernetes zorganizowane są zgodnie z najlepszymi praktykami Kustomize, z wyraźnym podziałem na konfigurację bazową i overlays:

```
k8s/
├── base/              # Bazowa konfiguracja
│   ├── main/          # Backend deployment + service
│   ├── web/           # Frontend deployment + service
│   ├── postgres/      # StatefulSet + PV/PVC + Secret
│   ├── redis/         # Deployment + service
│   └── ingress/       # Ingress + LoadBalancer
└── overlays/
    └── prod/          # Kustomization z tagami obrazów
```

Katalog `base` zawiera podstawowe definicje zasobów wspólne dla wszystkich środowisk. Każdy komponent ma własny podkatalog z plikami YAML definiującymi Deployment/StatefulSet oraz Service.

Katalog `overlays/prod` zawiera plik `kustomization.yaml`, który referencuje zasoby z base i nadpisuje specyficzne wartości dla środowiska produkcyjnego (np. tagi obrazów, liczba replik, zmienne środowiskowe).

== Deployments - listing fragmentów YAML

#figure(
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: main
  namespace: okane
spec:
  replicas: 1
  selector:
    matchLabels: { app: main }
  template:
    metadata:
      labels: { app: main }
    spec:
      containers:
        - name: main
          image: docker.io/library/main:prod
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 4321
          env:
            - name: PORT
              value: "4321"
            - name: JWT_SECRET
              value: sekretny-sekret
            - name: OPENAI_API_KEY
              value: openai-api-key
            - name: REDIS_URL
              value: redis://redis:6379
```,
  caption: [Manifest Deployment dla backendu]
)

*Replicas* - określa liczbę instancji poda, które powinny działać jednocześnie. W środowisku developerskim używamy `replicas: 1`, ale w produkcji można zwiększyć tę wartość dla zapewnienia wysokiej dostępności.

*Selectors i labels* - mechanizm kojarzenia Deployment z podami. `matchLabels` w selektorze musi dokładnie odpowiadać `labels` w template poda. Service również używa tych labels do identyfikacji podów, do których kierować ruch.

*Image pull policy: IfNotPresent* - instruuje Kubernetes, aby najpierw sprawdził obecność obrazu lokalnie przed próbą pobrania z registry. Kluczowe dla obrazów budowanych lokalnie w Minikube, które nie są dostępne w zewnętrznych registries.

*Environment variables* - konfiguracja aplikacji przekazywana jako zmienne środowiskowe. Wartości mogą być literałami (jak powyżej) lub referencjami do ConfigMaps/Secrets. URL Redis wykorzystuje nazwę Service (`redis`) jako hostname, wykorzystując wbudowane DNS Kubernetes.

*Container ports i named ports* - `containerPort` określa port, na którym nasłuchuje aplikacja wewnątrz kontenera. `name: http` to nazwany port, który może być referencowany w Service jako `targetPort`, co ułatwia utrzymanie spójności konfiguracji.

== Services

#figure(
```yaml
apiVersion: v1
kind: Service
metadata:
  name: main
  namespace: okane
spec:
  type: ClusterIP
  selector:
    app: main
  ports:
    - port: 80
      targetPort: http
      protocol: TCP
      name: http
```,
  caption: [Manifest Service dla backendu]
)

*ClusterIP (domyślny) dla komunikacji wewnętrznej* - Service typu ClusterIP otrzymuje wirtualny IP dostępny tylko wewnątrz klastra. To domyślny i najbardziej popularny typ Service, używany do komunikacji między komponentami aplikacji.

*Port 80 #sym.arrow targetPort http (named port)* - `port` to port, na którym Service jest dostępny wewnątrz klastra. `targetPort` wskazuje port kontenera, do którego ruch jest przekazywany. Używając nazwanego portu `http` zamiast numeru, konfiguracja jest bardziej czytelna i odporna na zmiany numerów portów.

*Selektory dopasowujące pods* - `selector` definiuje, które pody należą do tego Service. Kubernetes automatycznie aktualizuje listę endpoints Service gdy pody są tworzone lub usuwane.

== StatefulSet dla PostgreSQL

#figure(
```yaml
apiVersion: apps/v1beta2
kind: StatefulSet
metadata:
  name: postgres
  labels:
    app: postgres
    role: service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
      role: service
  serviceName: postgres
  template:
    metadata:
      labels:
        app: postgres
        role: service
    spec:
      containers:
        - name: postgres
          image: postgres:9.6
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  key: POSTGRES_USER
                  name: postgres
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  key: POSTGRES_PASSWORD
                  name: postgres
          ports:
            - containerPort: 5432
              name: postgres
              protocol: TCP
          volumeMounts:
            - name: postgres
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres
          persistentVolumeClaim:
            claimName: postgres
```,
  caption: [Manifest StatefulSet dla PostgreSQL]
)

*Persistentne dane przez PV/PVC (1Gi, hostPath)* - StatefulSet używa PersistentVolumeClaim do zapewnienia trwałości danych bazy danych. PersistentVolume (PV) jest skonfigurowany z typem `hostPath`, co oznacza, że dane są przechowywane na dysku węzła Minikube. PVC ma rozmiar 1Gi, co wystarcza dla developerskiego środowiska. Dane pozostają nienaruszone nawet po restarcie podów.

*Secret dla credentials (base64)* - Dane dostępowe do bazy danych (username i hasło) są przechowywane w Secret i wstrzykiwane jako zmienne środowiskowe poprzez `secretKeyRef`. Sekrety w Kubernetes są kodowane base64, co nie jest szyfrowaniem, ale oddziela wrażliwe dane od manifestów. W produkcji należy używać zewnętrznych systemów zarządzania sekretami (np. Sealed Secrets, Vault).

== Ingress

#figure(
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: okane
  namespace: okane
spec:
  ingressClassName: nginx
  rules:
    - host: web.okane.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
    - host: api.okane.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: main
                port:
                  number: 80
```,
  caption: [Manifest Ingress dla routingu]
)

*Nginx Ingress Controller (addon minikube)* - Ingress Controller to komponent, który implementuje reguły Ingress. Nginx Ingress Controller jest najpopularniejszą implementacją, działającą jako reverse proxy i load balancer. W Minikube instalowany jest jako addon: `minikube addons enable ingress`.

*LoadBalancer service dla ingress-nginx* - Aby `minikube tunnel` mógł wystawić Ingress na portach 80/443 na hoście, Ingress Controller potrzebuje Service typu LoadBalancer. Minikube addon automatycznie tworzy taki Service, a `minikube tunnel` odpowiada za routing ruchu z hosta do tego LoadBalancera.

*Dwie reguły hostów (web.okane.local, api.okane.local)* - Ingress wspiera host-based routing, kierując żądania do różnych Services w zależności od nagłówka HTTP Host. To pozwala na obsługę wielu aplikacji/serwisów przez jeden Ingress na jednym adresie IP.

*Konfiguracja /etc/hosts dla lokalnego dostępu* - Ponieważ `*.okane.local` nie są prawdziwymi domenami DNS, należy dodać wpisy w pliku `/etc/hosts` wskazujące te domeny na adres IP Minikube. W przypadku używania `minikube tunnel`, który wystawia LoadBalancer na 127.0.0.1, wpisy wyglądają tak:

```
127.0.0.1 web.okane.local
127.0.0.1 api.okane.local
```

#figure(
  rect(width: 100%, height: 8cm, stroke: 1pt + black, fill: rgb("#f0f0f0"))[
    #align(center + horizon)[
      #text(size: 14pt)[DIAGRAM 3: Deployment flow - Kustomize #sym.arrow kubectl apply #sym.arrow Kubernetes resources]
    ]
  ],
  caption: [Deployment flow - Kustomize do Kubernetes resources]
)

#figure(
  rect(width: 100%, height: 10cm, stroke: 1pt + black, fill: rgb("#f0f0f0"))[
    #align(center + horizon)[
      #text(size: 14pt)[DIAGRAM 4: Komunikacja sieciowa - przepływ requestów przez Ingress/Services/Pods]
    ]
  ],
  caption: [Komunikacja sieciowa - przepływ requestów]
)

== Wdrożenie

Wdrożenie aplikacji w klastrze Minikube odbywa się za pomocą jednej komendy wykorzystującej Kustomize:

```bash
sudo minikube kubectl -- apply -k k8s/overlays/prod
```

Flaga `-k` włącza Kustomize, który przetwarza manifesty z katalogu `k8s/overlays/prod`, nakładając transformacje na bazową konfigurację i generując finalne manifesty. Komenda `apply` tworzy lub aktualizuje zasoby w klastrze.

Użycie `sudo` jest konieczne gdy Minikube działa w trybie rootful. Komenda `minikube kubectl --` jest wrapperem nad kubectl skonfigurowanym do komunikacji z klastrem Minikube.

Wystawienie do hosta za pomocą:

```bash
sudo minikube tunnel
```

Komenda `minikube tunnel` tworzy trasę sieciową między hostem a klastrem Minikube, umożliwiając dostęp do Services typu LoadBalancer. Tunel działa w trybie foreground i musi pozostać uruchomiony - mapuje LoadBalancer IP (zazwyczaj pierwszy wolny z puli startowej 10.96.0.0/12) na localhost (127.0.0.1). Dzięki temu Ingress Controller jest dostępny na portach 80 i 443 na hoście, a żądania do `web.okane.local` i `api.okane.local` są prawidłowo routowane do klastra.

= Napotkane problemy i rozwiązania

== Problem 1: Problemy z Minikube na macOS (Orbstack)

*Opis*: Podczas wstępnych prób uruchomienia środowiska na macOS z wykorzystaniem Orbstack jako drivera dla Minikube napotkano na liczne problemy ze stabilnością i kompatybilnością. Orbstack, mimo że oferuje lekkie środowisko kontenerowe dla macOS, nie współpracował płynnie z Minikube. Występowały problemy z siecią, montowaniem wolumenów oraz ogólną niestabilnością klastra. Orbstack nie jest oficjalnie wspieranym driverem Minikube, co prowadziło do nieoczekiwanych błędów i trudności w debugowaniu.

*Rozwiązanie*: Podjęto decyzję o przeniesieniu całego środowiska na system Linux z natywnym Podmanem jako driverem. Linux zapewnia pełne wsparcie dla Podman i jest rekomendowaną platformą dla Minikube z driverem podman. Po migracji wszystkie problemy związane z niestabilnością zniknęły, a środowisko działało zgodnie z dokumentacją. Ta zmiana platformy, choć wymagała dodatkowej konfiguracji, znacząco poprawiła developer experience i stabilność środowiska.

== Problem 2: Tryb rootless i uprawnienia w Linuxie

*Opis*: W trybie rootless Podmana minikube tunnel nie jest w stanie działać poprawnie. Tunel wymaga operacji sieciowych wykonywanych jako root (dodawanie tras, konfiguracja interfejsów, bindowanie portów 80/443). Po uruchomieniu z użyciem sudo minikube działa jednak w kontekście użytkownika root, który ma własne \$HOME, własny XDG_RUNTIME_DIR i nie widzi rootless środowiska Podmana. W efekcie tunel uruchamia się w odizolowanym profilu, nie wykrywa działającego klastra i zgłasza błędy typu "host is not running". Próby z sudo -E również nie pomagają, bo root dalej nie ma dostępu do rootless podman socketa. Alternatywy, takie jak minikube service --url lub kubectl port-forward, technicznie działają, ale wystawiają porty na wartości inne niż 80/443, co powoduje rozbieżność między rzeczywistym adresem usług a wartością konfiguracji (NEXT_PUBLIC_API_URL). W efekcie frontend wysyła żądania na port 80/443, podczas gdy usługi działają na portach pomocniczych, co prowadzi do błędów komunikacji.

*Rozwiązanie*: Przejście na rootful Podmana jako driver eliminuje konflikt między rootless runtime a wymaganiami minikube tunnel. W trybie rootful cały stos - podman, minikube oraz tunel - działa w spójnym kontekście użytkownika i tej samej przestrzeni sieciowej. Dzięki temu minikube tunnel poprawnie wykrywa istniejący klaster, może wykonywać operacje sieciowe wymagające roota i wystawia porty LoadBalancera bezpośrednio na 80/443. Konfiguracja frontendu pozostaje zgodna z faktycznym adresem usług, a środowisko zachowuje się tak, jak w typowym klastrze Kubernetes korzystającym z Ingressa i standardowych portów.

== Problem 3: Konfiguracja zmiennych środowiskowych

*Opis*: Konfiguracja zmiennych środowiskowych w kontenerach wymaga rozróżnienia między wartościami wymaganymi w czasie budowania (build-time) a wartościami wymaganymi w czasie uruchomienia (runtime). Frontend Next.js wymaga, aby zmienne z prefiksem `NEXT_PUBLIC_` były dostępne podczas budowania obrazu, ponieważ są one wbudowywane w kod JavaScript przesyłany do przeglądarki. Próby przekazania ich tylko w runtime (np. przez ConfigMap w Kubernetes) nie działają - aplikacja nie widzi tych wartości. Z drugiej strony, backend NestJS potrzebuje wartości takich jak `DATABASE_URL` czy `JWT_SECRET` w runtime, i nie powinny one być zapisane na stałe w obrazie kontenerowym ze względów bezpieczeństwa.

*Rozwiązanie*: Zastosowano hybrydowe podejście wykorzystujące mechanizmy ARG w Dockerfile dla build-time oraz ConfigMaps/Secrets dla runtime. Dla frontendu, `NEXT_PUBLIC_API_URL` jest przekazywany jako ARG podczas budowania obrazu: `docker build --build-arg NEXT_PUBLIC_API_URL=http://api.okane.local/`. ARG jest następnie kopiowany do ENV, aby był dostępny dla procesu budowania Next.js. Dla backendu, wrażliwe dane takie jak hasła bazy danych i klucze API są przechowywane w Kubernetes Secrets i wstrzykiwane jako zmienne środowiskowe do podów w runtime. Mniej wrażliwe konfiguracje można przechowywać w ConfigMaps. To rozwiązanie zapewnia bezpieczeństwo (sekrety nie są w obrazach) oraz prawidłowe działanie aplikacji (build-time variables dostępne podczas kompilacji).

= Podsumowanie

== Rekapitulacja osiągniętych celów

Projekt konteneryzacji aplikacji Okane został zrealizowany zgodnie z założonymi celami. Wszystkie komponenty aplikacji - backend NestJS, frontend Next.js, baza danych PostgreSQL oraz Redis - zostały pomyślnie skonteneryzowane przy użyciu Podman. Utworzono optymalne obrazy kontenerowe wykorzystujące technikę multi-stage builds, co pozwoliło znacząco zredukować ich rozmiar. Skonfigurowano kompletne środowisko Kubernetes w Minikube, obejmujące Deployments, Services, StatefulSets, Ingress oraz zarządzanie konfiguracją poprzez Kustomize. Aplikacja została wdrożona i przetestowana w lokalnym klastrze, działając poprawnie z pełną komunikacją między komponentami.

== Zalety zastosowanego podejścia

Konteneryzacja aplikacji przyniosła szereg korzyści. Środowisko deweloperskie stało się w pełni reprodukowalne - każdy członek zespołu może uruchomić identyczne środowisko lokalnie jedną komendą. Izolacja komponentów w oddzielnych kontenerach zwiększyła bezpieczeństwo i ułatwiła zarządzanie zależnościami. Multi-stage builds zoptymalizowały obrazy, redukując ich rozmiar i czas deploymentu.

Orkiestracja przez Kubernetes zapewniła zaawansowane możliwości zarządzania aplikacją. Automatyczne health checks i restartowanie niedziałających podów zwiększyły niezawodność. Service discovery przez DNS uprościło komunikację między komponentami. Deklaratywna natura Kubernetes (Infrastructure as Code) umożliwiła wersjonowanie konfiguracji w Git oraz łatwe odtworzenie środowiska.

Kustomize pozwolił na eleganckie zarządzanie konfiguracją dla różnych środowisk bez duplikacji manifestów. Struktura base + overlays jest skalowalna i łatwa w utrzymaniu, umożliwiając szybkie dodawanie nowych środowisk (staging, QA) bez zmian w bazowej konfiguracji.

== Możliwości rozwoju

Utworzona infrastruktura stanowi solidną podstawę dla dalszego rozwoju. Naturalnym kolejnym krokiem jest wdrożenie Helm charts, które umożliwią parametryzację i wersjonowanie całej aplikacji jako pakietu, ułatwiając instalację w różnych klastrach.

Integracja z systemem CI/CD (np. GitLab CI, GitHub Actions) pozwoliłaby na automatyczne budowanie obrazów przy każdym commit, uruchamianie testów w kontenerach oraz automatyczne wdrażanie do środowisk testowych i produkcyjnych. Pipeline mógłby również skanować obrazy pod kątem podatności bezpieczeństwa przed deploymentem.

Monitoring i observability to kluczowe elementy produkcyjnego środowiska. Wdrożenie Prometheus do zbierania metryk, Grafana do wizualizacji oraz ELK/Loki do agregacji logów pozwoliłoby na kompleksowy wgląd w działanie aplikacji i szybką diagnostykę problemów.

W kontekście produkcyjnego wdrożenia warto rozważyć migrację do zarządzanego Kubernetes w chmurze (EKS, GKE, AKS) lub własnego klastra, co zapewniłoby wysoką dostępność, automatyczne skalowanie oraz profesjonalne SLA. Implementacja horizontal pod autoscaling pozwoliłaby aplikacji automatycznie dostosowywać liczbę replik do obciążenia.

#pagebreak()

= Bibliografia

#set par(hanging-indent: 1em)

Dokumentacja Kubernetes. (2024). _Kubernetes Documentation_. https://kubernetes.io/docs/

Dokumentacja Podman. (2024). _Podman Documentation_. https://docs.podman.io/

Dokumentacja Minikube. (2024). _Minikube Documentation_. https://minikube.sigs.k8s.io/docs/

Dokumentacja Kustomize. (2024). _Kustomize Documentation_. https://kustomize.io/

Dokumentacja Next.js. (2024). _Next.js Documentation - Output File Tracing (Standalone Mode)_. https://nextjs.org/docs/advanced-features/output-file-tracing

Dokumentacja NestJS. (2024). _NestJS Documentation_. https://docs.nestjs.com/