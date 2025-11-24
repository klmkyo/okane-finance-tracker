# Plan sprawozdania: Konteneryzacja aplikacji Okane

## Struktura dokumentu (szacunkowo 7 stron)

### 1. Wstęp (~0.5 strony)

- Cel projektu i zakres pracy
- Krótki opis aplikacji Okane (bez szczegółów funkcjonalnych)
- Uzasadnienie wyboru technologii konteneryzacyjnych
- Struktura dokumentu

### 2. Przegląd wykorzystanych technologii (~1.5 strony)

**Podman** (~0.4 strony)

- Alternatywa dla Dockera, daemonless architecture
- Rootless containers i bezpieczeństwo
- Integracja z Kubernetes przez CRI-O

**Minikube** (~0.4 strony)

- Lokalne środowisko Kubernetes
- Konfiguracja z driver=podman i container-runtime=cri-o
- Addony: ingress, metrics-server

**Kubernetes** (~0.5 strony)

- Orkiestracja kontenerów, podstawowe koncepty
- Pods, Deployments, Services, StatefulSets
- Namespace'y jako izolacja zasobów

**Kustomize** (~0.2 strony)

- Deklaratywne zarządzanie konfiguracją
- Overlays dla różnych środowisk (base/prod)
- Brak duplikacji manifestów

### 3. Architektura aplikacji (~1 strona)

[DIAGRAM 1: Architektura systemu - komponenty i ich relacje]

- Backend (NestJS) - API i logika biznesowa
- Frontend (Next.js) - interfejs użytkownika
- PostgreSQL - baza danych (StatefulSet)
- Redis - cache i kolejki BullMQ (Deployment)
- Namespace `okane` dla izolacji

**Komunikacja**:

- Ingress nginx jako entry point
- Routing: `web.okane.local` → frontend, `api.okane.local` → backend
- Wewnętrzna komunikacja przez Services

### 4. Konteneryzacja aplikacji (~1.5 strony)

**Multi-stage builds** - optymalizacja rozmiaru obrazów:

**Backend (main)** - listing fragmentu Dockerfile:

- Stage 1: base - Node.js 20 + pnpm
- Stage 2: dependencies - instalacja zależności (frozen-lockfile)
- Stage 3: build - kompilacja TypeScript
- Stage 4: runner - Alpine image, tylko runtime
- Wynik: Optymalny rozmiar obrazu, porównanie z vs bez multi-stage builds (póki co użyć placeholdery i zaznaczyć że są wartości placeholderowe)

**Frontend (web)** - podobna struktura:

- Build-time ARG dla NEXT_PUBLIC_API_URL
- Next.js standalone output
- User nextjs (non-root) dla bezpieczeństwa
- Tylko niezbędne pliki (.next/standalone, static, public)
- Wynik: Optymalny rozmiar obrazu, porównanie z vs bez multi-stage builds (póki co użyć placeholdery i zaznaczyć że są wartości placeholderowe)

[DIAGRAM 2: Proces budowania obrazów - wizualizacja multi-stage builds]

**Budowanie w Minikube**:

```bash
minikube image build -t main:prod -f packages/main/Dockerfile .
minikube image build -t web:prod -f packages/web/Dockerfile .
```

### 5. Konfiguracja Kubernetes (~1.5 strony)

**Struktura katalogów**:

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

**Deployments** - listing fragmentów YAML:

- Replicas, selectors, labels
- Image pull policy: IfNotPresent (lokalne obrazy)
- Environment variables (JWT_SECRET, REDIS_URL, etc.)
- Container ports i named ports

**Services**:

- ClusterIP (domyślny) dla komunikacji wewnętrznej
- Port 80 → targetPort http (named port)
- Selektory dopasowujące pods

**StatefulSet dla PostgreSQL**:

- Persistentne dane przez PV/PVC (1Gi, hostPath)
- Secret dla credentials (base64)

**Ingress**:

- Nginx Ingress Controller (addon minikube)
- LoadBalancer service dla ingress-nginx
- Dwie reguły hostów (web.okane.local, api.okane.local)
- Konfiguracja /etc/hosts dla lokalnego dostępu

[DIAGRAM 3: Deployment flow - Kustomize → kubectl apply → Kubernetes resources]

<!-- TODO może to przenieść wyżej? -->
[DIAGRAM 4: Komunikacja sieciowa - przepływ requestów przez Ingress/Services/Pods]

**Wdrożenie**:

```bash
minikube kubectl -- apply -k k8s/overlays/prod
minikube kubectl -- get pods -n okane
```

### 6. Napotkane problemy i rozwiązania (~1 strona)

**Problem 1: Problemy z Minikube na macOS (Orbstack)**

- Opis: Niestabilna współpraca Minikube z Orbstack jako driver
- Rozwiązanie: Przeniesienie środowiska na Linux z Podman jako native driver

**Problem 2: Tryb rootless i uprawnienia w Linuxie**

- Opis: Minikube w trybie rootless nie pozwala na `sudo`, ale Ingress wymaga bindowania do portów <1024 (80, 443)
- Problem z `minikube tunnel`: Uruchomienie jako sudo nie działa, prawdopodobnie z powodu różnych użytkowników (host vs tunnel)
- Rozwiązanie: Przejście na tryb rootfull

**Problem 3: Konfiguracja zmiennych środowiskowych**

- Opis: Build-time vs runtime environment variables w kontenerach
- Frontend wymaga NEXT_PUBLIC_API_URL w czasie budowania
- Backend potrzebuje DATABASE_URL w runtime
- Rozwiązanie: ARG w Dockerfile dla build-time, ConfigMaps/Secrets dla runtime

### 7. Podsumowanie (~0.5 strony)

- Rekapitulacja osiągniętych celów
- Zalety zastosowanego podejścia (konteneryzacja, orkiestracja)
- Możliwości rozwoju (Helm charts, CI/CD, monitoring)

## Bibliografia

- Dokumentacja Kubernetes
- Dokumentacja Podman
- Dokumentacja Minikube
- Dokumentacja Kustomize
- Dokumentacja Next.js (standalone mode)
- Dokumentacja NestJS

## Diagramy do stworzenia (4 sztuki)

Szczegółowe planowanie i tworzenie diagramów zostanie wykonane w osobnym zadaniu. Póki co, powinniśmy tylko zostawić placeholdery diagramów, nie implementować ich.

1. **[DIAGRAM 1]** - Architektura systemu (sekcja 3)
2. **[DIAGRAM 2]** - Proces budowania obrazów (sekcja 4)
3. **[DIAGRAM 3]** - Deployment flow (sekcja 5)
4. **[DIAGRAM 4]** - Komunikacja sieciowa (sekcja 5)