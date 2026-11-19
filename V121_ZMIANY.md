# V121 — grafiki profili i treningu

Ekran wejściowy korzysta z przypiętej grafiki: złotego powitania z tarczą,
niebieskiej i czerwonej ramki profili, gwiazd i błyskawic oraz wejścia do
panelu mamy. Postać, imię, etap edukacji, monety i pasek postępu są nadal
odczytywane z bieżącego profilu. Liczby namalowane w referencji nie stają się
danymi dziecka. Nowe portrety Hulka i Spider-Mana stosowane są na ekranie
profili; pozostałe widoki bohaterów i mentorów zachowują swoje zasoby.
Połączenie urządzeń i aktualizacja są dostępne w zwijanej sekcji pod profilami.

Górne sześć kafelków menu pochodzi z przypiętego projektu. Wykorzystano
wyłącznie menu; panel Trenuj widoczny niżej na tej samej ilustracji nie został
wstawiony pod menu. Przycisk Trening nadal otwiera osobny ekran Trenuj.

Wybór przedmiotów zachowuje proporcje całej nowej ilustracji 709×1536.
Ramki, ilustracje i napisy znajdują się w tych samych miejscach. Osobne
przyciski pokrywają oryginalne kadry. Pod nimi nie pozostają drugie kopie
ramek, które byłyby widoczne po naciśnięciu.

Wybór materiału, zakresu i trybu korzysta z oryginalnych ilustracji książek,
kartki z ołówkiem, kostki, pada i pucharu. Krawędzie kadrów są wygaszone do
tła kafelka. Każdy kadr skaluje się według rzeczywistej szerokości źródła
i zachowuje własne proporcje; nie wypełnia niezależnie ustawionego prostokąta.

Zachowano efekt naciśnięcia. Na ekranie przedmiotów obraca się globus,
poruszają się litery i cyfry, a nad Przyrodą przelatuje motyl. W trybach
treningu poruszają się kostka, pad i książki. Przejście następuje po animacji;
respektowane jest systemowe ograniczenie ruchu. Kolejność wyboru źródła,
zakresu i trybu oraz dostęp do materiałów dzieci pozostają bez zmian.

Pięć oryginalnych plików zapisano w assets/interface121 i opisano sumami
SHA-256 w sources.json. Ramki SVG zawierają obrazy PNG zakodowane bezstratnie
z tych samych pikseli oraz maski obszarów danych. Nie wymagają zewnętrznego
serwera. Odtworzenie zasobów: scripts/build-interface121.py z argumentami
ENTRY SUBJECTS MODES DASHBOARD RANGE w kolejności opisanej w skrypcie.

Walidacja: V121 sprawdza źródła, skalę kadrów, bieżące dane profili, wybranego
bohatera, sekwencję ekranów dla obu dzieci, puste książki, warstwy animacji
i komplet zasobów offline. Przeszły również V120, V119, V118, V95 i V93.
W starszych testach zaktualizowano odniesienia do zmienionych plików, klas
i wersji cache; testy przepływu, punktów i danych zachowano.

SVG wyrenderowano i sprawdzono oddzielnie. Pełnej strony w przeglądarce ani
na fizycznym Androidzie nie zweryfikowano: przeglądarka w tym środowisku
nie uzyskała dostępu do lokalnego podglądu. Nie jest to potwierdzenie wyglądu
piksel w piksel na urządzeniu użytkowniczki.

Paczka Termux aktualizuje V119 lub V120 do V121, włączając poprawkę holu V120.
Nie tworzy dodatkowej kopii katalogu. Niezapisane zmiany zatrzymują instalację.
