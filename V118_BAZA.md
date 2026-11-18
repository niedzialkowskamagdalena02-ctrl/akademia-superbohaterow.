# V118 — gotowe grafiki holu

Zmieniony jest hol spaceru po bazie. Jego widoki używają ostatniego zestawu
załączników w niezmienionej postaci. Kolory, proporcje i cały kadr pozostają
zachowane; obrazy są dopasowywane w całości, z pasami przy innych proporcjach
ekranu. Przesunięcie palcem zmienia kierunek i odpowiadający mu gotowy widok.
Wnętrza pomieszczeń, ich wyposażenie, gry i wcześniejsze akcje są zachowane.

| Plik źródłowy | Widok |
| --- | --- |
| 1000058752.png | Panoramiczny hol, bez panelu wejścia |
| 1000058751.png | Centrum Rozrywki |
| 1000058753.png | Hangar |
| 1000058754.png | Kącik zwierzaka |
| 1000058755.png | Zbrojownia |
| 1000058756.png | Sala Treningowa |
| 1000058757.png | Sklep |
| 1000058758.png | Skarbiec |
| 1000058767.png | Dodatkowy widok zielonej ściany |

Na narysowanych panelach leżą przezroczyste przyciski o obrysie dopasowanym
do panelu. Współrzędne są zapisane w pikselach źródłowego obrazu, a cały
obraz i obszary dotyku skalują się razem. Wcześniejsze etykiety, dłonie i
mikrofon są ukryte w holu, ponieważ występują już na dostarczonych grafikach.
Energia, poziom i numer wersji są aktualizowane wewnątrz narysowanych paneli.
Grafiki kryształów pochodzą z tego samego oryginalnego pliku.

Tapnięcie otwiera dotychczasowe pomieszczenie. Przeciągnięcie także rozpoczęte
na przycisku rozgląda się i nie uruchamia wejścia. Przytrzymanie prowadzi do
wybranego wejścia; jego czas nie zależy od płynności animacji. Moce bohatera
pozostają dostępne, a w poziomie ich przyciski znajdują się obok obrazu.

## Weryfikacja

- Sumy SHA-256 dziewięciu zasobów są zgodne z dostarczonymi plikami.
- Test V118 sprawdza wszystkie wejścia, ikonę, napis i strzałkę przy sześciu
  rozmiarach ekranu, proporcje obrazu, stan energii oraz cache offline.
- W przeglądarce sprawdzono siedem wejść i powroty w rzeczywistej aplikacji,
  zmianę widoku gestem, brak wejścia po przeciągnięciu i „Wybór widoku”.
- Sprawdzono rozmiary telefonu 360×800, 390×844, 412×915 i poziomy 844×390.
- Przytrzymanie sprawdzono dodatkowo na tym samym module spaceru w podglądzie
  z małą liczbą klatek. Mikrofon ma aktywny obszar dotyku i istniejącą akcję
  aplikacji; nagrywanie wymaga mikrofonu i zgody na konkretnym urządzeniu.
- Jest to test w przeglądarce o rozmiarach telefonu, nie na fizycznym Androidzie.

Starszy test V88 oczekuje akcji `hq:flight`, zastąpionej wcześniej przez
`hq:board`. Ten sam błąd testu występuje także na niezmienionej V117.
