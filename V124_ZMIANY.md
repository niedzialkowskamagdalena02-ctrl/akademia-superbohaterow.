# V124 — interfejs z dostarczonej paczki i archiwum grafik

- Wykorzystano paczkę „interface wysoka rozdzielczosc.rar”: nowe tło, ikonę książek, kartkę, kostkę, kontroler, puchar, rakietę, powrót, odsłuch, mikrofon, przycisk Dalej oraz źródła ekranu profili i wyboru widoku bazy.
- Oddzielne elementy otrzymały przezroczyste tło. Karty są budowane w elastycznej siatce z rzeczywistym tekstem i obramowaniami; nie ma pozycjonowania napisów na screenshotach ani dodatkowego interfejsu pod spodem.
- Poprawiono wybór zakresu, Trenuj / Wybierz grę / Sprawdzian oraz wybór książek, działów i stron. Rozwijane pola powiększają kartę w naturalnym układzie strony.
- Wybór książek korzysta z rzeczywistych tytułów, okładek lub pierwszego zdjęcia strony, zaznaczeń, działów i zakresów. Liczby z projektów graficznych nie są wpisane na stałe.
- Ekran profili i obrazy Widok klasyczny / Spacer po bazie korzystają z nowych dostarczonych źródeł. Bohater wybrany w ustawieniach, dane, złote, postęp i wejście do mamy pozostają aktywne.
- Menu Misje / Książki / Trening / Mentor itd. pozostaje z V118. Zaakceptowany wybór przedmiotów oraz animacje globusa, liter i motyla pozostają bez zmian. Animacje kostki, kontrolera i książek działają na osobnych przezroczystych ilustracjach.
- Audyt zaczyna od rzeczywistych stron wejściowych i ich importów. Uwzględnia także dynamicznie wybierane foldery grafik. Sam wpis w starej liście cache lub w teście nie jest dowodem używania grafiki.
- 62 nieużywane grafiki (9 062 417 bajtów) usunięto z aktywnego katalogu i listy offline po zapisaniu do osobnego, sprawdzonego archiwum GRAFIKI_NIEUZYWANE_V124.zip. Archiwum zawiera oryginalne ścieżki oraz sumy SHA-256. Nie tworzono kopii całego projektu i nie ruszano zdjęć książek ani danych przeglądarki.

Ilustracje zachowują natywną rozdzielczość źródeł; warstwy robocze są zapisane bezstratnie. Nie powiększano ich sztucznie do 4K.

Instalacja: mały instalator Python i oddzielny pakiet Git w ZIP. Poprzednią wersją wymaganą przez pakiet jest opublikowana V123. Po publikacji należy zaktualizować aplikację. Archiwum nieużywanych grafik pozostaje w Pobranych, poza aktywną aplikacją.
