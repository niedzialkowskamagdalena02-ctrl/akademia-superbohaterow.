# Treningi V140

Aktualizacja z archiwum „gry w treningu(1).rar”. Kryterium dostępu stanowi `profile.grade`: `P` albo `1`, `2`, `3`, niezależnie od nazwy dziecka. `testMode` pozostawia dostęp do starego katalogu w podglądzie mamy. Blokady działają w katalogu, bezpośrednim uruchomieniu, montowaniu ekranu i treningu mieszanym.

| Gra | Dostęp dziecka | Wykorzystane materiały |
| --- | --- | --- |
| Poznaj literki | P | Kosmiczne_Poznaj_Literki |
| Cyfrowe łowy | P | Kosmiczne_Cyfrowe_Lowy_v2; tylko odsłuch celu |
| Pisanie po śladzie | P | Kosmiczne_Pisanie_po_Sladzie i istniejące pełne ślady SVG |
| Literkowy Rajd | P | Pełny alfabet, Przystanki i Meta, Płynne Pisanie; połączone w najnowszej wersji |
| Rymowanki i literki | P | Rymowanki_30_Zagadek_Dwie_Wersje oraz kosmiczny interfejs; nowszy podział folderów ma pierwszeństwo |
| Zaczarowany Aparat | P | 24 scenerie i litery na przedmiotach |
| Literki w kolejności | P, 1–3 | Kosmiczne_Literki_w_Kolejnosci |
| Sylaby i głoski | P, 1–3 | Kosmiczne_Sylaby_i_Gloski; zatwierdzony podział po odpowiedzi |
| Dinozaur | P, 1–3 | Dinozaur_Dwie_Wersje; obrazki/litery albo bieżące zadania przedmiotu |
| Pociąg | P, 1–3 | Wspólna paczka Dwie_Wersje; 30 scenerii i 30 ładunków; dotyk i przeciąganie |
| Szafa | P, 1–3 | Dopasowane_Ubrania + nowsze Klatki_i_Zadania_AI; osiem zwierząt i osobne ubrania/klatki odmowy |
| Części mowy | 1–3 | Kosmiczne_Czesci_Mowy + Laboratorium_Slow; ilustracja dopiero po odpowiedzi |
| Czytanie ze zrozumieniem | 1–3 | Kosmiczne_Czytanie; dowód w tekście po odpowiedzi |
| Quiz polski | 1–3 | Kosmiczny_Quiz_Polski; liczba pól zgodna z rundą |

Ortografia i dyktando z V132 pozostają dostępne. Pozostałe gry są widoczne, ale wyszarzone u dzieci. Stare zasoby pozostają potrzebne w podglądzie mamy i nie są usuwane. Nowy katalog zawiera tylko 155 unikalnych plików graficznych z paczek; wspólne kosmiczne PNG korzystają z istniejących plików. Oryginalne bajty PNG/WebP zachowane, bez ponownego generowania i kompresji.

Gotowe HTML-e są komponentami tej samej aplikacji. Wspólny most obsługuje prawdziwy lektor, istniejącego nauczyciela/mikrofon, pauzę timerów, zapis i rozmiar sceny. Identyfikator rozgrywki w fragmencie URL nie zmienia klucza strony w pamięci offline. Podgląd mamy nie zapisuje postępu dziecka. Nowe sesje i pule pytań rozdzielono według profilu, poziomu, przedmiotu i materiału. Pominięcie nie nalicza poprawnej odpowiedzi. Nie wprowadzono nowych zasad wypłat złota; zadania używają istniejącego silnika i nagrody.

Dla materiałów z książek wykorzystywane są zatwierdzone pytania przypisane do wybranych stron. Gdy brakuje pasujących danych do typu gry, aplikacja wraca do katalogu z wyjaśnieniem; nie podkłada niepowiązanej bazy. AI uzupełnia pule w tle. Działania są przeliczane, pytania językowe muszą odpowiadać zatwierdzonej bazie, a nowe zagadki przechodzą dodatkową weryfikację. Brak połączenia zostawia gotową bazę gry.

Instalator V140 modyfikuje wskazane fragmenty treningów, zachowując pozostały kod aplikacji i holu. Kopię silnika zadań buduje z aktualnie zainstalowanego pliku. Historia Git stanowi punkt powrotu. Nie dotyka danych profili, IndexedDB ani zapisów dziecka. Publikacja odbywa się przez Termux użytkowniczki; samo wypchnięcie commita nie jest potwierdzeniem zakończenia Pages.

Sprawdzenie: `node tests/v140.cjs`, `node tests/training140-pages.cjs`, `node tests/training140-integration.cjs`, `python tests/training140-installer.py`. Zdarzenia i DOM są symulowane; nie jest to test renderowania na telefonie. Test instalatora obejmuje niezależne poprawki V139 oraz ponowne uruchomienie bez zmian. Rzeczywista płynność, dotyk i polski głos wymagają oceny na urządzeniu.
