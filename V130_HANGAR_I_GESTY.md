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

## Weryfikacja

`node tests/v130.cjs`: 22 rundy obręczy, 12 kodów, 12 rund balonów i 10 pełnych odpraw; prawidłowe i błędne odpowiedzi, brak przelotu przez otwór, podpowiedzi, rozkładanie bagażu, przekładanie i wyjmowanie walizek, bilety, przeciąganie i anulowanie gestu, kontrstrzał, piorun, upadek i ponowienie, zapis/odczyt postępu i pojedyncze nagrody, wybór poziomu przed kolejnym lotem, rzeczywiste funkcje menu i obie ścieżki wyjścia do hangaru. Sprawdza też niezmienione bajty wszystkich nowych grafik, zasoby offline i usunięte pliki.

Przeszły również kontrole V124, V125 i V129 dotyczące istniejących treningów, profili, widoku holu i kompletu dostarczonych klatek rąk. Wszystkie nowe obrazy zostały poprawnie zdekodowane.

Testy wykorzystują deterministyczny model DOM, zdarzeń i czasu oraz kontrolę zasobów. Nie są testem renderowania w przeglądarce ani pomiarem płynności na telefonie. Arkusz obejmuje układ pionowy, poziomy, małą szerokość i ograniczenie ruchu.
