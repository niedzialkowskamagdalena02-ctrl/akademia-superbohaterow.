# AKADEMIA SUPERBOHATERÓW — GŁÓWNY PROMPT I SPECYFIKACJA

**Wersja wymagań: 26.10.2026.** Ten dokument jest źródłem prawdy przy każdej kolejnej wersji. Nie usuwaj wcześniejszych funkcji podczas poprawiania innych. Przy zmianach porównuj nową wersję z tą listą, testuj regresje i jawnie raportuj, co działa, co jest demonstracją, a co wymaga serwera/usługi.

## 1. Zadanie dla wykonawcy / AI

Zbuduj i rozwijaj jedną mobilną, polskojęzyczną aplikację edukacyjno-motywacyjną „Akademia Superbohaterów” dla dwóch braci — Pawła i Patryka — z panelem mamy. Ma służyć do samodzielnego odrabiania lekcji, nauki, ćwiczeń dodatkowych i domowych obowiązków, a także nagradzać realny wysiłek rozbudową bazy superbohaterów. Aplikacja powinna być użyteczna na Androidzie, możliwa do uruchomienia w Samsung Kids (po sprawdzeniu ograniczeń), intuicyjna dla dzieci, maksymalnie darmowa, rozwijana latami i odporna na utratę danych. Priorytetem są funkcje, a nie dekoracyjna makieta. Implementuj wszystkie możliwe funkcje lokalnie; nie symuluj działania AI, OCR, synchronizacji, rozpoznawania pisma lub poprawności ćwiczeń, jeśli nie działają. W przypadku braków pokaż jasny komunikat i działającą alternatywę.

## 2. Użytkownicy, uprawnienia i nawigacja

- Mama: administrator; oddzielny ekran logowania/PIN; dodaje/edytuje książki, zdjęcia, przedmioty, poziomy, misje, punkty, nagrody, zatwierdza prace, sprawdza postępy i kopie zapasowe. Docelowo uwierzytelnianie serwerowe i dostęp zdalny.
- Paweł: aktualnie klasa 2, szkolny moduł Polski/Matematyka/Angielski, praca domowa i nauka dodatkowa, czytanie, nagrody. W przyszłości klasy 3–8 i dalsze przedmioty.
- Patryk: aktualnie przedszkole, nauka liter, cyfr, szlaczków, kolorów, kształtów i liczenia, rysowanie palcem, muzyczne nagrody. W przyszłości pełny moduł szkolny jak u Pawła.
- Ekran startowy pozwala wybrać profil. **Po wejściu do profilu NIE pokazuj u góry pozostałych profili ani łatwego przełączania**. Powrót tylko do ekranu wyboru; zabezpiecz wejście do profili i panelu rodzica PIN-em lub równoważną kontrolą. Sam lokalny PIN nie chroni danych przed technicznie sprawnym użytkownikiem — zaznacz ograniczenie.
- Dziecko nie może farmić XP na koncie brata, przejmować jego nagród ani zatwierdzać sobie prac. XP i postępy osobne dla każdego, ewentualnie dodatkowa wspólna baza rodzinna, jeśli rodzic włączy.
- Interfejs czytelny dla dziecka; duże przyciski, obrazki, minimalne wymaganie czytania, czytane głosem komunikaty.

## 3. Styl wizualny i świat gry

- Klimat Avengersów: ciemny granat, czerwony, złoty, futurystyczne centrum dowodzenia, baza superbohaterów, misje, poziomy, zbroje, gadżety, odblokowywanie bohaterów i wyposażenia; przyjazny, atrakcyjny, kolorowy dla młodszego dziecka.
- Motywy/charaktery mentorów: energiczny, żartobliwy, pajęczy bohater w stylu Spider-Mana; spokojniejszy, techniczny, dowcipny mentor w stylu Iron Mana. Możliwość wyboru. Bez podszywania się pod aktorów ani kopiowania ich głosów. W razie publicznego udostępniania uwzględnij prawa do marek/postaci i rozważ autorskie odpowiedniki.
- Punkty XP, waluta, odznaki, poziom bazy, kolekcja postaci, wyposażenie, odblokowane nagrody i historia muszą być trwałe. Krótkie minigry jako nagroda, nie kosztem czasu na lekcje.

## 4. Biblioteka podręczników — funkcja krytyczna

- Mama tworzy książkę: dziecko, etap/klasa, przedmiot, tytuł, część/tom, rok wydania (opcjonalnie), zakres stron.
- Import **wielu zdjęć na raz z galerii**, także możliwość zrobienia zdjęć aparatem; podgląd i numerowanie stron, ręczna zmiana numerów, kolejności, zamiana/ponowne dodanie zdjęcia, usunięcie konkretnej strony. Nie wymagaj robienia zdjęcia każdej strony osobno.
- **Pełna edycja książki po utworzeniu**: tytuł, klasa (np. przedszkole → klasa 1), przedmiot, dziecko, część, strony, OCR; bez utraty wcześniej dodanych zdjęć.
- Archiwum starszych podręczników; podmiana książek wraz ze zmianą klasy, zachowanie postępów.
- OCR rozpoznaje drukowane teksty, polecenia i w miarę możliwości numerację ćwiczeń z obrazów; pokazuje tekst do ręcznej korekty. Polski i angielski. Nie obiecuj bezbłędnej segmentacji poleceń ani matematycznych układów.
- Zdjęcia całej książki wymagają wydajnego magazynu (IndexedDB / serwerowy storage), nie samego localStorage; kompresja z zachowaniem czytelności, limity i komunikaty o pojemności. Uwzględnij prawa autorskie i prywatne korzystanie ze skanów.
- Paweł wybiera: przedmiot → podręcznik → strona → zadania, np. 1, 2, 3, 5. Strona widoczna podczas pracy, można powiększać zdjęcie, odsłuchiwać tekst i prosić o pomoc.

## 5. Prace domowe i kontrola rodzica

- Mama może zdalnie dodawać zadania: przedmiot, podręcznik, strona, numery zadań, opis, termin, punkty, wymagane zdjęcie; także Paweł może sam zgłosić, co było zadane.
- Statusy: do zrobienia, w trakcie, zgłoszone/wysłane, do poprawy, zatwierdzone, odrobione w szkole, opcjonalnie anulowane.
- Paweł po wykonaniu pracy robi zdjęcie lub wybiera z galerii, przypina do misji i wysyła mamie. **Samo zdjęcie nie oznacza zatwierdzenia ani poprawnego rozwiązania.**
- Mama widzi zdalnie zdjęcia, powiększa je, akceptuje lub odsyła z komentarzem tekstowym/głosowym. XP za prace po zatwierdzeniu. Mama może oznaczyć „odrobione w szkole” i zaakceptować bez powtarzania.
- Zdalny podgląd i synchronizacja na różnych telefonach wymagają hostingu HTTPS, kont, bazy i magazynu zdjęć; dopóki nie są podłączone, wyraźnie pokaż „lokalnie na tym urządzeniu”.

## 6. Nauka niezależna od prac domowych

- Osobny moduł „Trening” / „Uczę się” dostępny bez zadanej pracy: czytanki, polski, matematyka, angielski, fiszki, zadania i quizy, gry pamięciowe, powtórki; materiał z podręcznika i dodatkowy materiał dostosowany do wieku.
- Polski: sylabizowanie (opcjonalne kolorowanie sylab), czytanie krótkich fragmentów 1–3 zdań, stopniowe trudności, budowanie wyrazów, części mowy (np. rzeczowniki, czasowniki), rozumienie tekstu.
- Czytanie: przycisk odsłuchu, nagrywanie/rozpoznawanie wypowiedzi dziecka (jeśli wspierane), delikatne podpowiedzi, brak karania za błędy rozpoznawania mowy, nagrody za wysiłek i kolejne fragmenty.
- Angielski: słówka z książki i dodatkowe, tłumaczenie, obrazki, **prawidłowa wymowa audio**, literowanie po angielsku, odsłuch każdej pozycji, fiszki, testy pisemne i ustne, dostosowanie trudności.
- Matematyka: działania, zadania tekstowe, wyjaśnienia krok po kroku, dobór do klasy.
- Zmiana klasy NIE usuwa starych umiejętności ani materiałów. Powtórki z niższych poziomów nie mogą być łatwą metodą farmienia XP: niższe nagrody/limity; rodzic może włączyć pełne XP, gdy jest to rzeczywisty cel rozwojowy.

## 7. Patryk — moduł przedszkolny, kontrola poprawności

- Śledzenie palcem liter, cyfr i szlaczków: duże wzory, animacja, wskazówki, dotykowe płótno. Litery polskie, z czasem także małe i wielkie, kształty i liczby.
- **BŁĄD Z v7 DO NAPRAWY:** dziecko może dostać punkty mimo że nie napisało poprawnej literki. Obecny prosty licznik ruchów palca nie jest rozpoznawaniem litery.
- Nie przyznawaj XP za samo kliknięcie „Ukończ”, pusty ekran, przypadkowe bazgroły lub wielokrotne mazanie w jednym miejscu. Wdrożenie realnej weryfikacji: odwzorowanie ścieżki na punkty kontrolne, kolejność/ruch w pobliżu kształtu, minimalne pokrycie, tolerancja dla wieku, jasne informacje „spróbuj jeszcze raz”. Nie twierdź, że to rozpoznawanie pisma ręcznego, jeśli to tylko porównanie śladu. Jeśli kontrola nie jest jeszcze wiarygodna, nie przyznawaj automatycznie punktów; oznacz ćwiczenie jako trening bez oceny lub zatwierdzane przez rodzica.
- Nauka cyfr, liczenie obiektów, kolory, kształty, dopasowywanie, proste minigry i pochwały. Wybór poziomu przedszkole → klasa 1 itd. bez resetu bazy.
- Muzyczne nagrody: zatwierdzona przez rodzica lista piosenek dziecięcych z YouTube, np. „Planeta Ziemia”; bilet po wykonaniu określonej liczby ćwiczeń. Kontrola rodzica, bez niekontrolowanego autoplay i rekomendacji.

## 8. Głos, głośniczki, mikrofon — funkcja krytyczna

- **Widoczne ikony głośnika przy KAŻDYM poleceniu, czytance, słówku, instrukcji, odpowiedzi mentora i komunikacie ważnym dla dziecka.** Odczyt właściwego języka (polski/angielski), regulacja szybkości, możliwość powtórzenia.
- **Stałe pływające kółeczko z ikoną mikrofonu na dole ekranu dziecka**, łatwe do naciśnięcia. Po kliknięciu dziecko może powiedzieć np.: „Otwórz polski”, „Pokaż stronę 37”, „Mam zadanie drugie i piąte”, „Przeczytaj polecenie”, „Co to rzeczownik?”, „Pomóż mi”, „Chcę ćwiczyć angielski”.
- Zaimplementuj działające rozpoznawanie mowy, jeśli przeglądarka/urządzenie na to pozwala, wraz z czytelną informacją o uprawnieniach mikrofonu, błędach i możliwością wykonania tej samej czynności dotykiem. Rozpoznawanie może wymagać internetu i HTTPS; sprawdzić kompatybilność Android/Samsung Kids.
- Rozróżnij **komendy nawigacyjne**, które można obsłużyć lokalnie, od **otwartych pytań do AI**, których prosty system komend nie zrozumie. Nie pozoruj AI.
- Głosy mentorów: spróbuj użyć różnych faktycznie dostępnych głosów TTS; gdy dostępny jest tylko jeden, nie udawaj, że zmiana tempa/wysokości tworzy dwa naturalne głosy. Dodatkowe nagrane kwestie autorskie są opcją bez abonamentu. Bez imitacji głosów aktorów.

## 9. Asystent edukacyjny / AI

- Cel: Paweł samodzielnie odrabia lekcje, gdy mama jest w pracy. Asystent zna kontekst otwartej strony i numeru zadania, odczytuje polecenie, tłumaczy je prostym językiem, przypomina pojęcia, zadaje pytania pomocnicze, stopniuje podpowiedzi i **nie podaje od razu gotowych odpowiedzi**.
- Dwa charaktery mentorów do wyboru: techniczny (Iron Man) i żartobliwy (Spider-Man), z wiekowo odpowiednim językiem.
- Etap darmowy: lokalne słowniki wyjaśnień, szablony podpowiedzi, reguły, OCR, TTS i komendy głosowe. Prawdziwe generatywne AI z obrazem wymaga połączenia z usługą, bezpiecznego backendu i kontroli limitów/kosztów. ChatGPT Plus nie obejmuje API. Można ocenić darmowe limity dostawców, ale nie zakładać ich trwałości.
- Dane dzieci: minimalizacja, zgoda i kontrola rodzica, brak publicznego ujawniania zdjęć/nagrań, ograniczenie retencji; stosować wymagania dostawcy modelu dla dzieci poniżej 13 lat.

## 10. Misje domowe i nawyki

- Osobny moduł „Misje domowe” jako kategoria obok szkolnych: mycie zębów, wynoszenie śmieci, sprzątanie, spakowanie plecaka, odkładanie zabawek itd.
- Mama zdalnie dodaje zadania, terminy, cykliczność (codziennie, dni tygodnia, jednorazowo), punktację i wymaganie zdjęcia. Dziecko zgłasza wykonanie, mama akceptuje, XP dopiero po akceptacji; bez podwójnego naliczania.
- Zadania odpowiednie do wieku i rozsądna równowaga nagród; higiena nie powinna być uzależniona od nagrody.

## 11. Rozwój od przedszkola do starszych klas

- Jeden system poziomów edukacyjnych na każde dziecko: przedszkole, klasy 1–8, docelowo możliwość dalszego rozszerzenia.
- Przedmioty konfigurowane, nie zakodowane na sztywno: polski, matematyka, angielski, później przyroda, historia, geografia, biologia, chemia, fizyka, informatyka itd. Możliwość dodawania własnego przedmiotu i przypisania książek.
- Mama zmienia klasę, listę przedmiotów, książki, trudność i cele bez utraty historii, XP, postaci i bazy.
- Patryk z czasem otrzymuje te same moduły szkolne co Paweł; Paweł zyskuje trudniejsze materiały.

## 12. Architektura, dane, aktualizacje i bezpieczeństwo

- Preferowany kierunek: PWA na stałym adresie HTTPS, instalowalna na Androidzie, jedna aktualizowana aplikacja. Oddziel kod interfejsu od danych użytkownika; migracje schematu danych między wersjami.
- Dla lokalnego prototypu: IndexedDB na zdjęcia i większe dane, stabilny format eksportu/importu JSON lub archiwum zawierające także zdjęcia, kopie zapasowe, sprawdzanie poprawności importu, potwierdzenie przed nadpisaniem, możliwość przywrócenia.
- **Aktualizacja nie może kasować XP, odblokowanych postaci, zbroi, poziomu bazy, historii, zdjęć, książek ani misji.** Nie obiecuj tego dla różnych plików file:// bez przetestowanego mechanizmu migracji. Przy migracji zachowaj zgodność z v5/v6/v7 lub opisz ograniczenia.
- Docelowo: konta i uprawnienia, szyfrowanie transportu, bezpieczna synchronizacja między telefonami, osobne rekordy dzieci, zdjęcia w magazynie online, rodzic zdalnie zatwierdza zadania, ograniczenia dostępu do danych, kopie zapasowe.
- Bez płatnego wkładu, jeśli to możliwe: otwarte biblioteki, darmowe limity hostingu/bazy/OCR, ale wyraźnie zaznacz ograniczenia pojemności, kosztów i warunków.

## 13. Testy akceptacyjne — obowiązkowe przed wydaniem

1. Profil Pawła nie pokazuje przycisku przełączenia do Patryka, nie pozwala naliczyć XP Patrykowi; rodzic ma własny dostęp.
2. Mama tworzy książkę, dodaje np. 10 zdjęć naraz z galerii, poprawia numery stron, zmienia klasę książki, edytuje zdjęcie i OCR; dane pozostają.
3. Paweł otwiera właściwą książkę i stronę, zaznacza zadania 1, 2, 3, 5, odsłuchuje polecenie.
4. Głośniczek jest dostępny przy każdej ważnej treści; odczytuje po polsku lub angielsku, gdy obsługiwane.
5. Mikrofon na dole pozwala powiedzieć „Otwórz polski” i uruchamia właściwą nawigację albo pokazuje uczciwy komunikat o braku obsługi.
6. Paweł dodaje zdjęcie wykonanej pracy z galerii lub aparatu; status „wysłane”; mama widzi i zatwierdza; XP przyznane raz.
7. Zadanie „odrobione w szkole” można zatwierdzić z panelu mamy.
8. Patryk nie dostaje XP po kliknięciu „Ukończ” bez rysowania, po przypadkowym bazgraniu ani po narysowaniu poza wzorem. Jeśli automatyczna ocena nie jest gotowa, XP wstrzymane.
9. Misje domowe można dodać i zatwierdzić, bez ponownego naliczania punktów.
10. Trening dodatkowy działa bez zadanej pracy domowej, a banalne powtórki nie umożliwiają nieograniczonego XP.
11. Zmiana klasy Patryka lub Pawła nie usuwa postępów i bazy.
12. Eksport/import i migracja zachowują książki, zdjęcia, XP, odznaki, zadania i bazę; test odtworzenia na nowej instalacji.
13. Każda funkcja oznaczona jako działająca jest rzeczywiście testowana; raport rozróżnia: działa lokalnie / wymaga internetu / wymaga backendu / planowana.

## 14. Kolejność wdrażania bez utraty zakresu

1. Napraw krytyczne błędy: fałszywe XP u Patryka; brak głośników i mikrofonu; uprawnienia profili; edycja i import książek.
2. Stabilna baza danych i kopie ze zdjęciami; pełny przepływ książka → zadanie → zdjęcie → akceptacja.
3. Trening niezależny od prac domowych; komplet ćwiczeń i mechanika nagród.
4. PWA HTTPS i synchronizacja między telefonami, rodzicielski podgląd zdalny.
5. Prawdziwy asystent AI z obrazem i bezpieczną obsługą dzieci, różne naturalne głosy — tylko gdy technicznie i kosztowo wykonalne.

**Polecenie dla każdej kolejnej iteracji:** „Zaktualizuj Akademię Superbohaterów na podstawie tego dokumentu. Nie usuwaj istniejących funkcji. Najpierw napraw zgłoszone błędy, potem wdrażaj kolejne punkty. Dostarcz działający plik i listę testów oraz wyraźnie wskaż ograniczenia. Nigdy nie przyznawaj punktów bez realnego wykonania lub zatwierdzenia zadania.”


AKTUALIZACJA: Pisanie palcem sprawdzane automatycznie na podstawie dopasowania do wzoru (pokrycie, dokładność i długość śladu). Nie wymaga zatwierdzenia mamy. Punkty tylko za zaakceptowany ślad, ograniczenie dzienne i jedna nagroda za daną literę/cyfrę na dzień. Algorytm jest przybliżony i wymaga testów na telefonie; nie gwarantuje idealnego rozpoznawania pisma.


## Quizy i zabawy dla najmłodszych — dodane 26.10.2026
Rozpoznawanie litery spośród czterech, dopasowanie małej do dużej litery, wskazywanie pierwszej litery wyrazu, wybieranie cyfry i rozpoznawanie kształtów. Losowe odpowiedzi, głośniczek do odsłuchu polecenia, natychmiastowa informacja o błędzie i XP wyłącznie za poprawne odpowiedzi, z limitem dziennym.

## V9 – 26.10.2026
- Podgląd wszystkich odblokowań bazy z panelu mamy bez wpływu na zapisane dane.
- Ekonomia opisywana jako pieniążki, nie XP; wewnętrzne pola xp/coins zachowane dla kompatybilności.
- Typ misji Test / sprawdzian, z przedmiotem i opcjonalnym podręcznikiem i stroną; przy braku książki startuje generator ćwiczeń danego przedmiotu. UWAGA: pełny system oceniania testów i automatycznego generowania pytań z OCR strony wymaga kolejnej implementacji.
- Bardziej budynkowy wygląd bazy: elewacja, antena, okna, pokoje i gabloty.
- Ilustracje przedmiotów nadal są autorskimi rysunkami SVG, nie oficjalnymi zasobami Marvela.
