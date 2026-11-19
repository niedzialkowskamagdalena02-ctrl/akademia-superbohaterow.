# V120 — wejścia z nowych ujęć holu

W ciągłym holu V119 umieszczono pełne wejścia do siedmiu pomieszczeń
z plików w Ujecia_Holu_4K.zip: Hangar, Centrum Rozrywki, Kącik zwierzaka,
Zbrojownia, Sala Treningowa, Sklep i Skarbiec. Wcześniej z dostarczonych
obrazów pochodziły tylko osobno rzutowane tabliczki z nazwami.

Nowa tekstura zawiera wejścia wraz z nazwami. Nad nimi są wyłącznie
przezroczyste obszary dotyku. Usunięto aktywne osobne tabliczki V119.
Obszary dotyku korzystają z tej samej powierzchni pomieszczenia co tekstura,
również podczas chodzenia; nie unoszą się przed ścianą. Przy brzegu ekranu
są przycinane do widocznego fragmentu. Obrót nadal korzysta z jednej tekstury
i jednej kamery, bez przełączania zdjęć.

Źródła w ZIP mają 1773×3840 px (Hangar 1778×3840). Wycięte fragmenty
nie zawierają górnego interfejsu ani dolnych rąk, mikrofonu i instrukcji.
Ręce i moce bohatera, rzeczywista energia, wszystkie wejścia i powroty
pozostają obsługiwane przez aplikację.

Tekstura ma 6144×3072 px. Jest kompozycją przeskalowanego tła V119
i zamaskowanych fragmentów nowych ujęć, zapisanych bezstratnie. Powiększenie
tła nie dodaje mu szczegółów. Osobne ujęcia mają różne perspektywy i nie
stanowią bezszwowego zapisu 360°; dopasowano ich wejścia, zachowując wspólne
tło. Nie jest to model 3D wnętrza ani odwzorowanie całych ujęć piksel w piksel.

Osobny Hol_glowny_4096x2048-1.webp faktycznie ma 1536×768 px.
Kokpit_Akademii_ostry_3840.webp ma 710×1536 px i przedstawia wybór profili,
a nie kokpit. Te pliki nie zostały użyte do zastąpienia holu ani samolotu.
Nie zmieniano zakończonego w V119 wyboru profili ani treningów.

Odtworzenie tekstury: `python3 scripts/build-hall120.py /ścieżka/Ujecia_Holu_4K.zip`
(Pillow). Plik sources.json zachowuje rozmiary, SHA-256 źródeł, obszary
wycięcia, maski, miejsca docelowe i współrzędne aktywnych tabliczek.
Te same współrzędne są eksportowane do hall-entries120.js.

Walidacja: test V120 obejmuje 189 pozycji kamery i 9072 porównania promieni
tekstury z obszarem dotyku, komplet siedmiu wejść, wykluczenie wrysowanego
interfejsu oraz dostępność zasobów offline. Testy V119, V118, V95, V93 i V86
przeszły; w starszych testach uaktualniono wyłącznie oczekiwaną wersję cache
i odniesienia zmienionej warstwy holu.

Test przeglądarkowy tests/v120-browser.cjs przygotowano dla WebGL i Canvas,
ale nie został wykonany: lokalne Chromium zatrzymuje się podczas uruchamiania
z błędem uprawnień do socket(). Podgląd tekstury sprawdzono na renderowanych
ujęciach. Nie wykonano testu na fizycznym Androidzie.

Publikacja odbywa się przez aktualizator Termux. Git zachowuje V119 jako
poprzedni commit. Aktualizator nie tworzy dodatkowych kopii katalogów ani nie
nadpisuje zmian użytkowniczki. Nie wykonano publikacji V120 podczas jej
przygotowania.
