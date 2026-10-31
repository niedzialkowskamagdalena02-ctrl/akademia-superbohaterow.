# V81 — drugi zestaw przygód

Rozwój na v81-test, na bazie V80 abc711b7551c8e73ae1e6eca410902f2ae90246d. Bez zmiany konfiguracji GitHub Pages, Cloudflare Workera, Androida lub danych rodziny. main pozostaje V80.

## Dostęp

Paweł → Trening → Angielski → Tajna biblioteka Avengersów → Słówka → wybór materiału → Rozpocznij misję. Lista obejmuje dotychczasowe 10 gier i 12 nowych. Mieszanka treningu i sprawdzianu rotuje dostępne gry wraz z klasycznymi ćwiczeniami. Nie ma nowego panelu poza Akademią.

## Nowe mechaniki

1. Księżycowy labirynt — chodzenie, trzy bramki ze słówkami, meta.
2. Magiczna układanka — cztery fragmenty ilustracji odpowiadającej słówku, części pisowni, przeciąganie lub dwa dotknięcia.
3. Zgadnij, kto to mówi — lokalne odgłosy psa, kota i krowy, wybór spośród zwierząt z materiału.
4. Pudełko niespodzianka — dopasowanie koloru i zabawki do opisu.
5. Złodziej liter — ruchome stworki i nieruchomy wybór tej samej litery.
6. Leśne echa — powtarzanie słowa przez mikrofon i kwitnące drzewo.
7. Kosmiczna poczta — paczki i planety z kategoriami, dotyk lub przeciąganie.
8. Wieża z liter — wybór liter i upuszczanie klocka nad platformą; nietrafienie w platformę można powtórzyć.
9. Wyścig gąsienic — rysowanie połączeń lub dwa dotknięcia, przetasowana prawa kolumna, rosnąca gąsienica.
10. Lodowy sklepik — dokładne smaki i liczba gałek, przeciąganie/dotyk, cofanie.
11. Iron Man — cztery części autorskiej uproszczonej zbroi, dopasowanie i pisownia, promień energii.
12. Spider-Man — tylko aktywne piętro, trafienie siecią, wspinanie do dachu, autorski uproszczony rysunek.

## Materiał i postępy

Cele oraz słówka do wyboru pochodzą z wybranych stron. Specjalne gry pojawiają się tylko przy odpowiednim materiale: odgłosy potrzebują zwierząt, pudełko kolorów i zabawek, lody smaków i liczb, poczta co najmniej dwóch kategorii. Kategorie i instrukcje są elementami interfejsu. Ilustracje są symbolami słówek, nie wycinkami fotografii podręcznika.

Każda mini-gra jest jednym zadaniem. Podetapy nie przyznają dodatkowych Kredytów. Ukończenie przechodzi przez istniejący mechanizm punktów i nagród. Ujawnienie odpowiedzi wyłącza nagrodę. Pomoc w obsłudze pozostaje bez limitu; zasady wskazówek do odpowiedzi w sprawdzianie pozostają zachowane. Zapis i wznowienie przechowują ukończone etapy.

## Weryfikacja

368 kontroli automatycznych zakończonych bez błędów:

- tests/v81.cjs: 65 — wszystkie 12 mechanik w obu trybach, błędy, zakres źródłowy, wznowienie, nagrody, pomoc.
- tests/v80.cjs: 52 — poprzednie gry, słówka, losowanie, zasoby offline i izolacja.
- tests/v79.cjs: 43 — czytanie, słuchanie, symulowany kanał mowy Androida.
- tests/legacy/test.cjs: 176 — panel mamy, materiały, działy, generator, kontrola pytań, nawigacja, misje i uprawnienia.
- tests/legacy/sync-test.cjs: 32 — symulacja dwóch telefonów z transportem Request/Response i pamięcią transakcyjną.

Przeglądarka: wczytanie każdej nowej gry, pełne ukończenie zbroi, puzzli i lodów; wejście piętro wyżej Spider-Manem; połączenie par dotknięciami i rysowaniem linii; puzzle przeciąganiem; przejście od profilu do listy wszystkich 22 gier. Sprawdzono układ przy szerokości 375 px w ramce z niezależnym obszarem widoku.

Nie wykonano fizycznego testu mikrofonu na telefonie Pawła. Rozpoznawanie mowy sprawdza rozpoznane słowo, nie jest analizą akcentu lub precyzyjną oceną fonetyczną. Jakość głosu, uprawnienia mikrofonu, szybkość animacji i wygodę dotyku należy ocenić na jego urządzeniu. Nie użyto produkcyjnego AI ani danych rodziny podczas kontroli. Dotychczasowe poprawki nauczyciela AI pozostają osobnym zadaniem.

## Podgląd Magdy

Prywatny istniejący adres testowy otrzymuje V81, bez zmiany adresu głównej Akademii. Zawiera przykładową książkę V81 i oddzielny magazyn danych; synchronizacja rodzinna i produkcyjny Worker są wyłączone. Przykładowy PIN mamy: 0000. Nie należy wpisywać kodu połączenia rodziny w podglądzie.

Publikacja V81 w głównej Akademii dopiero po akceptacji Magdy.
