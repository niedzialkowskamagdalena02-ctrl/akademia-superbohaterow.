# V127 — oryginalne ręce i animacje

Aktualizacja podłącza grafiki z dostarczonego archiwum `gotowe.rar`. Żaden PNG nie został przerysowany, retuszowany, ponownie skompresowany ani zastąpiony obrazem wygenerowanym. 181 używanych plików zachowuje oryginalne bajty; identyczne kopie współdzielą jeden plik.

- Hulk: lewy i prawy cios oraz lewe i prawe uderzenie w dół.
- Kapitan Ameryka: obie pięści oraz rzut/powrót tarczy w prawej dłoni.
- Thor: obie pięści, uderzenie młotem i rzut/powrót młota.
- Iron Man: obie pięści bez podświetlenia oraz laser z każdej dłoni.
- Spider-Man: obie pięści oraz wystrzał sieci z każdej dłoni.

Przyciski nad lewą i prawą ręką wybierają ruch. Klawisze F/G uruchamiają lewą/prawą rękę; przy tarczy i młocie F uruchamia dostarczony wariant prawą dłonią.

Odtwarzanie korzysta z oryginalnych klatek. Kod dopasowuje wyłącznie położenie i jednolitą skalę z zachowaniem proporcji. Trzy kwadratowe warstwy przejściowe Thora są umieszczane obok jego oryginalnej drugiej dłoni; grafiki nie są wyginane ani odbijane w lustrze. Rozbłyski i ślady dostarczone jako osobne obrazy są dodatkowymi nakładkami. Elementy zapisane już wewnątrz oryginalnej klatki pozostają jej częścią.

Sześć dostarczonych wariantów pajęczyn pojawia się kolejno. Ślady pozostają w miejscu trafienia przy obracaniu i poruszaniu kamerą, w bieżącej sesji spaceru. Wgniecenia są umieszczane na podłodze. Limit to 12 ostatnich śladów, aby nie gromadzić bez końca dużych obrazów w pamięci telefonu.

Klatki danego ruchu pobierają się przy pierwszym użyciu, z informacją o ładowaniu. Kolejne użycia korzystają z pamięci i pamięci podręcznej aplikacji. Aktualizacja nie wymusza pobierania wszystkich animacji w tle.

Usunięto 12 zastąpionych grafik dłoni z serii 88/90/93 i ich stare wpisy pamięci podręcznej. Pełna lista: `V127_REMOVED.json`. Nowe grafiki oraz źródła i ich sumy SHA-256 opisuje `assets/hq/hands127/sources.json`.

Zakres obejmuje ręce, ruchy i efekty w spacerze. Obraz i kamera holu, treningi, książki, postępy i dane rodziny nie są zmieniane.

Sprawdzenie: identyczność wszystkich 181 PNG ze źródłami, 19 ruchów i 152 renderowane klatki, proporcje w pionie i poziomie, ładowanie, przełączanie trybu i kliknięcia rzeczywistego kontrolera spaceru oraz istniejące kontrole interfejsu i holu. Obrazy sprawdzono w renderowaniu Canvas; nie wykonano testu na telefonie użytkowniczki.
