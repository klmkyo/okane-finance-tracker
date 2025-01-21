# Okane - Aplikacja do Śledzenia Finansów

Nowoczesna aplikacja do śledzenia finansów zbudowana przy użyciu Next.js i NestJS.

## Wymagania Wstępne

- Node.js (zalecana wersja 18 lub wyższa)
- PostgreSQL (wersja 13 lub wyższa)

## Struktura Projektu

```
okane/
├── packages/
│   ├── main/    # Aplikacja backendowa NestJS
│   └── web/     # Aplikacja frontendowa Next.js
├── docs/        # Zawiera diagramy klas, erd i dokumentacja użytkowa
```

## Instrukcja Instalacji

### 1. Włącz Corepack

```bash
corepack enable
```

### 2. Zainstaluj Zależności

```bash
pnpm install
```

### 3. Konfiguracja Środowiska

Utwórz pliki `.env` w obu pakietach, kopiując odpowiednie pliki `.env.example`:

#### Backend (.env w packages/main)

```env
# Baza danych
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/okane

# Uwierzytelnianie
JWT_SECRET=your_jwt_secret_here

# OpenAI (dla funkcji AI)
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend (.env w packages/web)

```env
# URL API (nie może kończyć się ukośnikiem)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Konfiguracja Bazy Danych

1. Utwórz bazę danych PostgreSQL o nazwie `okane`
2. Przejdź do pakietu main:

```bash
cd packages/main
```

3. Uruchom migracje:

```bash
pnpm db:migrate
```

4. (Opcjonalnie) Wypełnij bazę przykładowymi danymi:

```bash
pnpm db:seed
```

### 5. Uruchamianie Serwerów Deweloperskich

#### Uruchamianie Serwer Backend

```bash
cd packages/main
pnpm dev
```

Backend będzie dostępny pod adresem http://localhost:3000

#### Uruchamianie Serwer Frontend

```bash
cd packages/web
pnpm dev
```

Frontend będzie dostępny pod adresem http://localhost:3001

## Dostępne Skrypty

### Root

- `pnpm install`: Instalacja wszystkich zależności

### Backend (packages/main)

- `pnpm dev`: Uruchomienie serwera deweloperskiego
- `pnpm build`: Budowanie wersji produkcyjnej
- `pnpm start:prod`: Uruchomienie serwera produkcyjnego
- `pnpm db:generate`: Generowanie nowych migracji
- `pnpm db:migrate`: Uruchamianie migracji
- `pnpm db:studio`: Otwarcie Drizzle Studio
- `pnpm test`: Uruchomienie testów

### Frontend (packages/web)

- `pnpm dev`: Uruchomienie serwera deweloperskiego
- `pnpm build`: Budowanie wersji produkcyjnej
- `pnpm start`: Uruchomienie serwera produkcyjnego
- `pnpm lint`: Uruchomienie lintera

## Funkcje

- Obsługa wielu walut
- Transakcje cykliczne
- Śledzenie celów oszczędnościowych
- Panel finansowy
- Kategoryzacja transakcji

## Stack

- **Frontend**: Next.js, React Query, Ant Design, TailwindCSS
- **Backend**: NestJS, DrizzleORM, PostgreSQL
- **Narzędzia**: TypeScript, BullMQ, integracja z OpenAI
