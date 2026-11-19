# V122 — poprawki interfejsu po porównaniu ze wzorami

- Menu Misje / Książki / Trening / Sala odkrywców / Mentor / Baza Avengersów i gry przywrócone dokładnie z kodu V118. Jego style są takie same jak w V118.
- Zaakceptowany ekran „Trenuj”, wybór przedmiotów i jego animacje są bez zmian.
- Wybór materiału i zakresu książek połączone: od razu dostępne „Cały materiał z książek”, „Wybierz książkę, dział lub strony” oraz przejście do innych materiałów. Nie ma drugiego powtórnego ekranu książek.
- Profile i karty materiałów korzystają z całych warstw grafiki razem z tłem i poświatą. Domyślnych portretów Hulka i Spider-Mana nie nakłada się drugi raz w prostokątnych wycinkach. Inny bohater wybrany w ustawieniach nadal jest uwzględniany.
- Nazwy, klasy, złote i paski postępu pochodzą z aktualnych danych aplikacji. Paski mają widoczne zakończenie i efekt świetlny.
- Trenuj / Wybierz grę / Sprawdzian mają karty z wzoru, mocniejsze oryginalne obramowania i gwiaździste tło. Usunięto zewnętrzną dodatkową ramkę i nadmierną pustą przestrzeń.
- Namalowany w grafice mikrofon usunięto z dolnej karty. Pozostaje jeden działający mikrofon aplikacji. Krawędzie ucięte w dostarczonym wzorze uzupełniono z przeciwnej krawędzi tej samej karty.
- Zachowane: efekt naciskania, dźwięk, animacje i obsługa ograniczenia ruchu, ekran mamy/PIN, dane i nawigacja gier.
- Warstwy zapisano bezstratnie w rozdzielczości źródłowej. Ilustracji nie rozciągano ani nie powiększano do sztucznego 4K. Żywe napisy i paski skaluje przeglądarka.

Walidacja: testy faktycznego przepływu aplikacji dla obu dzieci, powroty, wybór wszystkich/wybranych stron, brak materiałów, zgodność menu z V118 i pikseli ilustracji ze źródłami, kompletność zasobów offline. Przeglądarka w tym środowisku nie pozwala uruchomić lokalnego podglądu; nie jest to potwierdzenie wyglądu na telefonie.

Instalator ma mały plik Python i oddzielny pakiet Git w ZIP. Pokazuje etap startu od razu, domyślnie sprawdza istniejący `~/akademia`, zachowuje dane i historię Git, nie tworzy kolejnej kopii projektu.
