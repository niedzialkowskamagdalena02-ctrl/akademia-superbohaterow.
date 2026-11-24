# V141: hol i ścieżki obrazków

W V138–V140 konfiguracja sceny, tekstury WebGL i tryb 2D żądały `assets/hq/hall138/png/...`. Oryginalne PNG są zapisane bez podfolderu `png/`. Oba renderery otrzymywały więc 404. Poprawka korzysta z jednej listy rzeczywistych plików, jednego pobrania/dekodowania na grafikę oraz wspólnego zestawu obrazów dla WebGL i zastępczego canvas 2D. Błędy przygotowania tekstur również przełączają na 2D. Oryginalne PNG pozostają bez zmian.

Od pierwszego wyrenderowania ekranu spaceru widoczna jest osłona z zamglonym oryginalnym podglądem bazy. Pasek i procenty odpowiadają rzeczywiście odczytanym bajtom, przygotowanym obrazom i przygotowaniu ruchów postaci. Nie ma sztucznego timera postępu. Widok odsłania się po przygotowaniu pierwszej klatki i dwóch klatkach odświeżenia; bufor WebGL jest ponownie rysowany przy odsłonięciu. Błąd pozostawia czytelny ekran z ponowieniem i powrotem do wyboru widoku. Ponowne ustawienie tych samych rozmiarów canvas nie czyści już gotowej klatki.

W grach część przypisań obrazków z selektorami, np. `$('.animal').src`, omijała normalizację ścieżek w generatorze. Dotyczyło to zwierząt w szafie, przedmiotu w dinozaurze i elementów aparatu. Generator normalizuje teraz prawą stronę każdego przypisania `src`. Testy wykonują właściwy kod podglądów i sprawdzają istnienie rzeczywistych plików obrazków, również dla ośmiu zwierząt i ich klatek odmowy. Nie zmieniono zasad ani banków zadań.

Nowe adresy modułów i stron gier mają `v=141`, aby aktualizacja offline nie przejmowała starych wadliwych kopii HTML/JS. Paczka zawiera wyłącznie poprawkę kodu, bez ponownego pakowania grafik z V140. Główna aplikacja otrzymuje zmianę wersji i dwóch importów; reszta, w tym postępy i treningi, zostaje zachowana.

Sprawdzenie: `node tests/hall141.cjs`, `node tests/training140-pages.cjs`, `node tests/training140-integration.cjs`, `python tests/hall141-installer.py`. Grafika i DOM są symulowane; nie jest to ocena płynności i wyglądu na fizycznym telefonie.
