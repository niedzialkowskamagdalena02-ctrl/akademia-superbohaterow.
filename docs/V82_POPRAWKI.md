# V82 — nauka, mentor, portfel i gry

Kontynuacja V81 oraz przygotowanej V81.1. Sprawdzony punkt produkcyjny: edb9798b382732b670f0294fe3bb6e8682934619. Poprawki V81.1 są włączone w tę aktualizację, więc osobna instalacja V81.1 nie jest potrzebna. Nie utworzono zewnętrznej wersji testowej ani kolejnej kopii zapasowej.

## Zachowanie po aktualizacji

- Wszystkie 35 elementów bazy oraz dwie płatne gry używają tej samej kontroli salda i ceny. Brak środków blokuje zakup; dokładna kwota wystarcza; ponowne kliknięcie nie kupuje ponownie. Usunięto pustą pozycję katalogu. Nieprawidłowe saldo nie umożliwia odblokowania.
- Kosmiczny Wąż przesuwa się co 320 ms, wcześniej co 165 ms. Pauza, restart i sterowanie pozostają.
- Mentor treningowy odpowiada na konkretne pytania przez AI, z historią i kontekstem bieżącej gry. Nie ma automatycznej sekwencji dwóch ogólnych podpowiedzi. Gotowe rozwiązanie wymaga osobnej, aktualnej zgody po informacji o braku pieniędzy za zadanie. Odmowa pozostawia możliwość nagrody. Pytania o obsługę i pytania ogólne są bez limitu. Sprawdzian nie ujawnia rozwiązania.
- Dotychczasowe plansze są dostępne w polskim (10 zgodnych mechanik) i matematyce (5 mechanik), gdy wybrane strony dostarczają odpowiednią treść. Dotyczy treningów i sprawdzianów; działające klasyczne zadania pozostają. Polski uwzględnia polskie litery. Nie przeniesiono fonetyki EN ani angielskich kategorii do innych przedmiotów.
- Angielski w treningu dla klas 1–2: przed zadaniem dziecko poznaje jego słowa: ilustracja, słowo, polskie znaczenie, spokojny wzór EN/PL/EN. Początkujący najpierw dopasowuje, później pisze z modelem, następnie z pamięci. Postęp zapisuje się przy dziecku i książce. Pisanie z modelem nie daje pieniędzy ani nie udaje samodzielnego opanowania słowa. Sprawdzian nie otrzymuje tych lekcji ani wzoru.
- Nagrody z podręcznika mają osobny identyfikator każdego ukończenia; wcześniejszy wspólny klucz książka/dzień odrzucał dalsze wypłaty. Ekran końcowy czeka na zapis i pokazuje zapisaną kwotę. Przy problemie zapisu można ponowić bez podwójnej wypłaty, także po wznowieniu. Nagroda trafia do dziecka, które rozpoczęło misję.
- Dodano wypłatę za ukończone krótkie wyzwania poza książką i pełną klasyczną czytankę. Klasyczne ćwiczenia, dyktando, pisanie po śladzie, krzyżówka oraz zatwierdzane przez mamę misje zachowują swoje zasady i limity. Pomoc z gotowym rozwiązaniem nie przynosi nagrody. Kwoty liczone są liczbowo również po imporcie tekstowego salda.
- Przywrócono treningi przedszkolne Patryka i opis roli połączenia z V81.1.

## Weryfikacja

Testy JS obejmują wszystkie ceny katalogu, brak środków, duplikaty, odmowę i zgodę na rozwiązanie, spóźnione odpowiedzi, 10 mechanik polskich i 5 matematycznych w dwóch trybach, zakres źródeł, słówka i ich poziom opanowania, zapis nagród, błędy zapisu, kolejne sprawdziany tej samej książki, czytanie, dyktando, pisanie, misje mamy i synchronizację.

W przeglądarce z przykładowymi danymi: wejście w angielski pokazuje etap poznawania słów; maska Spider-Mana odejmuje 15 złotych (200 → 185); zadanie zbroi korzysta z wybranych działań; odmowa ujawnienia pozwala rozwiązać samodzielnie; ukończenie dodaje 1 złoty (185 → 186), a saldo pozostaje po ponownym otwarciu.

Granice: brak fizycznego telefonu Pawła/Patryka; usługi produkcyjnego AI i rodzinna synchronizacja wyłączone podczas lokalnej kontroli w przeglądarce. Mikrofon, kolejka głosów i transport synchronizacji sprawdzone w testach z symulowanymi odpowiedziami. Rzeczywista wymowa i rozpoznawanie mowy wymagają sprawdzenia po aktualizacji na telefonie. Kod Androida i Worker pozostają bez zmian.

## Instalacja

Jednoplikowy instalator `AKADEMIA_V82_AKTUALIZUJ.py --publish` przenosi historię Git V81.1/V82 i aktualizuje `main` wyłącznie przez fast-forward. Sprawdza hash paczki, właściwe repozytorium, bieżącą wersję i niezapisane pliki objęte zmianą. Nie wykonuje force, resetu ani usuwania lokalnych plików. Nie publikuje zewnętrznej gałęzi testowej. Kopia `v80-backup` nie jest zmieniana. Przy nowych zmianach na main instalator zatrzymuje się do sprawdzenia.
