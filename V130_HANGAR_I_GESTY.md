# V130 — gry w samolocie i sterowanie dłońmi

## Hangar

Przeczytano instrukcje TXT, dokument DOCX od balonów oraz cztery podglądy HTML. Paczka RAR zawiera tę samą odprawę co ZIP „Akademia Małych Pilotów”.

- Wejście: hangar → samolot → kokpit z menu → wybór poziomu → gra. Ponowne wejście zawsze pokazuje menu.
- Każda gra ma „Wróć do kokpitu” oraz „Wysiądź”. Wyjście prowadzi wprost do hangaru w widoku spaceru i widoku klasycznym.
- Odprawa: Nowy Jork, Paryż, Londyn, Rzym i Tokio; dwa poziomy, osobne walizki i pasażerowie, bilety, przejście między fotelami, zmiana luków na telefonie, przeciąganie lub dwa kliknięcia, poprawianie bagażu przed zatwierdzeniem, start i pieczątki.
- Obręcze: 11 działań na każdym poziomie, dźwignia, sterowanie poziome, ocena dopiero przy przelocie przez otwór, powtórka błędnej rundy, brak zbliżania przed pierwszym ruchem, odznaka.
- Balony: osobne ruchome balony z dynamicznymi liczbami, strzał z nosa samolotu, trafienie w faktycznym miejscu, kontrstrzał błędnego balonu, ruchoma chmura, piorun i upadek poniżej sceny, ponowienie bez utraty zaliczonych rund.
- Kokpit matematyczny: sześć kodów na poziom, klawiatura ekranowa i fizyczna, zachowany wpis po błędzie, sześć trwałych kontrolek i wskaźnik mocy, osobny start po ostatnim kodzie, odznaka.

Postęp zapisuje się w dotychczasowym profilu dziecka, w `base.headquarters.hangar130`, oraz pomocniczo lokalnie. Nie usunięto ani nie zresetowano żadnego starego klucza postępu. Podgląd testowy nie zapisuje postępu dziecka. Pominięcie animacji i jej zwykłe zakończenie przyznają tę samą pieczątkę/odznakę, z blokadą powtórnego zaliczenia.

## Grafiki i porządki

Skopiowano 47 grafik (10,39 MiB), bez przeskalowania, rekompresji ani zmiany bajtów. Ładowane są zasoby wybranej gry. Puste walizki i balony mają napisy z kodu. Podglądy, filmy referencyjne, prompty i balony z nadrukowanymi cyframi nie trafiają do zasobów aplikacji.

`scripts/hangar130-assets.json` opisuje źródła i sumy SHA-256. `scripts/hangar130-removed.json` wymienia 19 usuniętych plików: 15 dawnych grafik, 2 zastąpione moduły i 2 arkusze CSS. Sprawdzono importy, CSS, konfiguracje i dynamiczne ścieżki. Zachowano wspólne zasoby pozostałych misji. Usunięte materiały nadal można odzyskać z historii Git; nie utworzono dodatkowej kopii od kopii.

## Sterowanie dotykiem w bazie

Przyciski „Lewa”, „Prawa”, „Pięści”, „Młot”, „Tarcza”, „Laser” i „Sieć” zostały usunięte z widoku pierwszej osoby. Sterowanie działa na widocznych dłoniach; reszta pokoju zachowuje dotychczasowy obrót i chodzenie.

| Gest | Działanie |
|---|---|
| Jedno stuknięcie w dłoń | Cios tą ręką, po maksymalnie 250 ms oczekiwania na drugi tap. |
| Dwa szybkie stuknięcia w tę samą dłoń | Dokładnie jedna akcja specjalna, bez wcześniejszego ciosu. |
| Przesunięcie prawej dłoni w górę | Wyjęcie odblokowanej tarczy lub młota. |
| Przesunięcie prawej dłoni w dół | Schowanie przedmiotu, przywrócenie obu pięści. |
| Przeciągnięcie rozpoczęte na dłoni | Nie uruchamia ciosu i nie obraca kamery, także po wyjściu palcem ze strefy dłoni. |

Kapitan i Thor używają przedmiotu prawą ręką. Pojedyncze stuknięcie trzymaną tarczą lub młotem jest uderzeniem; podwójne — rzutem i powrotem. Lewa ręka pozostaje wolna i boksuje, z widocznym przedmiotem w prawej. Schowany przedmiot trzeba najpierw wyjąć gestem w górę.

Iron Man strzela laserem z dowolnej dłoni po odblokowaniu istniejącego przedmiotu `arc` (reaktor łukowy). Spider-Man strzela z dowolnej dłoni po odblokowaniu `spiderweb` (wyrzutnia sieci); zachowano również uprawnienie starszego przedmiotu `web`. Obie moce działają bez wyjmowania przedmiotu. Bez wymaganego atrybutu podwójne stuknięcie wykonuje jeden zwykły cios. Hulk używa swojej sekwencji uderzenia w dół jako podwójnego stuknięcia.

Do ciosu tarczą użyto początkowych klatek dostarczonego rzutu, kiedy tarcza jest jeszcze trzymana, oraz tych samych klatek w powrocie. Nie stworzono nowej grafiki. Pełna sekwencja rzutu pozostaje dostępna w całości. Wszystkie 303 oryginalne klatki i ich pliki pozostają bez zmian.

Ruchy zwykłe, specjalne i ich pierwsze klatki przygotowują się razem. Rozpoznany gest nie przełącza trybu przez pobieranie kolejnej paczki. Obsługa gestów anuluje oczekujący cios przy przeciągnięciu, przerwaniu dotyku, zmianie pokoju i wyjściu z widoku. Skróty F/G obsługują lewą/prawą dłoń bez przycisków na ekranie.

## Smugi przy pięści

Jasny koniec oryginalnego PNG wiatru jest połączony z aktualnym położeniem pięści, mierzonej z przezroczystości grafiki. Uwzględniono zmianę położenia między klatkami, lewą/prawą rękę, warstwy Thora i kadrowanie pionowe/poziome. Efekt powstaje przy dłoni, zamiast w stałym punkcie na środku ekranu. PNG nie zostały przerysowane ani zmienione. `scripts/build-hand-anchors130.py` zapisuje wyłącznie współrzędne.

## Weryfikacja

`node tests/v130.cjs`: 22 rundy obręczy, 12 kodów, 12 rund balonów i 10 pełnych odpraw; prawidłowe i błędne odpowiedzi, brak przelotu przez otwór, podpowiedzi, rozkładanie bagażu, przekładanie i wyjmowanie walizek, bilety, przeciąganie i anulowanie gestu, kontrstrzał, piorun, upadek i ponowienie, zapis/odczyt postępu i pojedyncze nagrody, wybór poziomu przed kolejnym lotem, rzeczywiste funkcje menu i obie ścieżki wyjścia do hangaru. Sprawdza też niezmienione bajty wszystkich nowych grafik, zasoby offline i usunięte pliki.

Przeszły również kontrole V124, V125 i V129 dotyczące istniejących treningów, profili, widoku holu i kompletu dostarczonych klatek rąk. Wszystkie nowe obrazy zostały poprawnie zdekodowane.

`node tests/v130-gestures.cjs` sprawdza czas 250 ms, rozróżnianie rąk, pojedynczą akcję po dwukliku, brak poprzedzającego ciosu, anulowanie dotyku, wyjmowanie i chowanie przedmiotów, warunki odblokowania oraz strefy dłoni w pionie i poziomie. Test V129 dodatkowo uruchamia prawdziwy kontroler dotyku na natywnych płótnach, przygotowuje mieszane zwykłe/specjalne ruchy wszystkich pięciu postaci i kontroluje natychmiastowy start oraz budżet pamięci. `node tests/v130-wind.cjs` sprawdza 208 położeń smugi i piksele efektu przy aktywnej pięści.

Testy wykorzystują deterministyczny model DOM, zdarzeń i czasu oraz kontrolę zasobów. Nie są testem renderowania w przeglądarce ani pomiarem płynności na telefonie. Arkusz obejmuje układ pionowy, poziomy, małą szerokość i ograniczenie ruchu.
