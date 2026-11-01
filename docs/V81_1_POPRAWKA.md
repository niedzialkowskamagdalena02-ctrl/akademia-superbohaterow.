# V81.1 — trening przedszkolny i zakupy

Baza: opublikowana V81, edb9798b382732b670f0294fe3bb6e8682934619. Gałąź: v81-fix1-test. Produkcyjny main pozostaje bez zmian do akceptacji.

## Potwierdzone przyczyny

- trainingFlowMarkup wywoływało v75PreschoolView, której definicji brakowało. Odtworzono ReferenceError z komunikatu Patryka. Przywrócono istniejący widok z V75, bez przebudowy treningów.
- BASE_ITEMS zawierało pustą pozycję pomiędzy Thorem i Pazurami Czarnej Pantery. Array.find wywoływało funkcję dla undefined i przerywało zakup elementów znajdujących się dalej. Usunięto dodatkowy separator i zabezpieczono wyszukiwanie przed pustą pozycją.

## Pozostałe zmiany

- Nagłówek pokazuje rolę połączenia: panel mamy lub konkretny profil dziecka.
- Na ekranie Misje niepołączonego dziecka jest istniejący formularz Połącz z mamą; połączone dziecko ma status i przycisk Pobierz od mamy. Instalacja rodzica wyświetla informację o swojej roli. Żadne tokeny ani powiązania nie są zmieniane automatycznie.
- Wersja interfejsu V81.1 i nowa wersja pamięci offline wymuszają pobranie poprawionego modułu.
- Eksport JSON przenosi rekordy danych, nie kopiuje klucza połączenia z localStorage; metadane sync78 są wykluczone. Sam import nie ustanawia nowego połączenia rodziny. Na podstawie samego napisu Połączono ze zdjęcia nie ustalono, czy instalacja Patryka jest powiązana jako dziecko czy rodzic — nowy opis roli pozwoli to sprawdzić.

## Sprawdzenie

422 kontrole automatyczne bez błędów:
- 54 nowe: wejście Patryka do Treningu, oba tryby, zadania bez książki i przekazanie zatwierdzonych stron; zakupy wszystkich 35 elementów przez prawdziwy handler i katalog, dokładne ceny, gratisy, brak środków, podwójne kliknięcie, zapis, izolacja profili, kolejka synchronizacji i dozwolone uprawnienia; role i przyciski połączenia, eksport bez danych połączenia.
- 368 dotychczasowych: V79 (43), V80 (52), V81 (65), panel mamy i pozostałe funkcje (176), transport synchronizacji (32).

Przeglądarka: Patryk → Trening → Sala treningowa i Próba bohatera, poprawna odpowiedź i punkt w każdym trybie. Paweł → Baza → zakup Maski Spider-Mana: portfel 200 → 185, status W bazie; po ponownym otwarciu 185 i zakup zachowane.

Poprzednie testy nie obejmowały brakującego ekranu wejściowego przedszkola ani zakupów z pełnego katalogu. Nowe testy używają faktycznego katalogu i obsługi zdarzeń.

Nie wykonano fizycznego testu w Samsung Kids; poprawka dotyczy współdzielonego kodu strony otwieranej przez APK. Nie zmieniono APK, Workera, mechanizmu synchronizacji ani konfiguracji publikacji. Nie tworzono kolejnej kopii V80 lub V81. Istniejąca v80-backup pozostaje nienaruszona.

Prywatny podgląd zawiera oddzielne dane oraz jednorazowe testowe środki na zakup. Produkcyjny portfel dzieci nie jest zmieniany.
