# Konsultacje Lekarskie - System Rezerwacji

Aplikacja do rezerwacji wizyt lekarskich (Frontend + Backend).

## Wymagania
*   Node.js (wersja 14+ zalecana)
*   npm

## Instrukcja Uruchomienia

Aplikacja składa się z dwóch części: **Frontend** (React) oraz **Backend** (Node.js/Express). Należy uruchomić obie części w osobnych terminalach.

### 1. Backend (Serwer)

Otwórz pierwszy terminal i wykonaj następujące komendy:

```bash
# Wejdź do folderu serwera
cd server

# Zainstaluj zależności (tylko za pierwszym razem)
npm install

# Utwórz plik .env (jeśli nie istnieje) i skonfiguruj połączenie z MongoDB
# (Przykładowa konfiguracja w .env.example)

# Uruchom serwer w trybie deweloperskim
npm run dev
```

Serwer wystartuje domyślnie na porcie **5000** (`http://localhost:5000`).

### 2. Frontend (Klient)

Otwórz drugi terminal (w głównym folderze projektu) i wykonaj:

```bash
# Zainstaluj zależności (tylko za pierwszym razem)
npm install

# Uruchom aplikację kliencką
npm run dev
```

Aplikacja będzie dostępna pod adresem wyświetlonym w terminalu (zazwyczaj `http://localhost:5173`).

## Struktura Projektu

*   `/` - Kod źródłowy Frontendu (Vite + React)
*   `/server` - Kod źródłowy Backend (Express + MongoDB)

## Technologie

*   **Frontend**: React, TypeScript, Tailwind CSS, Vite, Lucide React, Date-fns
*   **Backend**: Node.js, Express, Mongoose (MongoDB), JWT Auth
