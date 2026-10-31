# Akademia V80 — wersja testowa

Podstawa: main, V79, commit 59617fe9e607893a3218bb8fab6522b485325799. Zmiany V80 rozwijane na v80-test. Bez łączenia z main i bez publikacji produkcyjnej.

## Gry w obecnej Akademii

Trening i sprawdzian zawierają mieszankę klasycznych pytań i nowych gier. Angielski → książki → Słówka → wybrany materiał pozwala również wybrać konkretną grę. Nie dodano nowej głównej zakładki gier.

Mechaniki: kuchnia, rakieta z literami, wyspa dźwięków, rebus złożeniowy, łapanie słów, jajo, szukanie przedmiotów, balony, potworek tak/nie, potworek z mikrofonem.

Każdy cel pochodzi z wybranych stron. Kuchnia wymaga słów o jedzeniu, rebusy obu części i wyniku w materiale, a wyspa nagrania odpowiedniej głoski. Wyspa ma obecnie próbki [æ] i [m]. Jeśli materiał nie wystarcza, konkretna gra jest niedostępna; aplikacja nie dopisuje obcych słówek.

## Pozostałe poprawki

- Po zaliczonym czytaniu lektor odczytuje słowa oraz polskie znaczenia.
- Kafelki par odczytują EN lub PL również po zaliczeniu. Pary nie stoją naprzeciw siebie.
- Opcje słówek najpierw odtwarzają wyraz, a przycisk Sprawdź wybór zatwierdza odpowiedź.
- Słuchanie korzysta z całego wybranego zakresu i pamięta częstość słów.
- Pomoc w obsłudze nie zużywa podpowiedzi ani nie odbiera monet. Ujawnienie rozwiązania w treningu wymaga kolejnych próśb i uprzedza o braku monet. W sprawdzianie rozwiązanie nie jest ujawniane.
- Niebiesko-turkusowo-zielony gradient; zachowane przyciski 3D.

## Izolacja podglądu

Osobny adres, punkt wejścia v80-test.html, baza IndexedDB academy_v80_preview_2026. Normalny index.html nie importuje tego punktu wejścia. Synchronizacja rodzinna jest wyłączona w podglądzie i dodatkowo blokowane są żądania do produkcyjnego Workera. Materiały przykładowe i Kredyty są testowe. PIN przykładowego panelu mamy: 0000. Podgląd nie rejestruje produkcyjnego service workera i nie zawiera prywatnych materiałów rodziny ani sekretów.

## Weryfikacja

52 testy nowych mechanik, źródeł, mowy, pomocy, punktów, wznowienia, wyboru gry i pamięci offline; 43 testy wcześniejszego czytania i symulowanego kanału Android; 176 testów regresyjnych aplikacji, panelu mamy, pytań i treningów; 32 testy synchronizacji na transportach testowych. Łącznie 303 zaliczone kontrole automatyczne.

Dodatkowo sprawdzono w działającej przeglądarce wejście przez profil dziecka, angielski, książkę, Słówka, wybór materiału i konkretnej gry; ułożenie słowa, wyklucie oraz naliczenie testowej nagrody. Podczas tej kontroli naprawiono konflikt klas CSS planszy i animacji jaja/balonów.

Ograniczenia: rozpoznawanie mowy w automatycznych testach jest symulowane; nie potwierdza jakości mikrofonu i polskich/angielskich głosów na fizycznym telefonie. Produkcyjne AI oraz połączenie telefonów nie są testowane na prywatnych danych w tym podglądzie. Kod Androida V79 i produkcyjny Worker pozostają bez zmian.

## Materiały graficzne

assets/games80/{chef,rocket,island}.webp — własne ilustracje przygotowane z generowania obrazów. Polecenia: przyjazny fioletowy kucharz na przezroczystym tle; pomarańczowa rakieta z turkusowym oknem na przezroczystym tle; tropikalna polana nad morzem z wolnym środkiem planszy. Tryb generowania nowych obrazów, następnie kompresja do WebP. Pozostałe ilustracje: Twemoji, CC BY 4.0, oryginalne SVG. Nagrania Wikimedia Commons, CC BY-SA 3.0; autorzy i pełne źródła w assets/games80/credits.html.

## Dalsze wydania

Rozwój na oddzielnej gałęzi → odizolowany podgląd → ocena Magdy → dopiero po wyraźnej akceptacji połączenie z main. Nie ma automatycznego połączenia ani automatycznej publikacji V80 na głównym adresie.
