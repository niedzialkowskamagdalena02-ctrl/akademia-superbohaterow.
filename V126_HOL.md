# V126 — pełny hol 360° i usunięcie starych grafik

Źródłem jest dostarczony plik Hol_360_poprawny_uklad_6144x3072.png.
Zachowano cały obraz i standardowe współrzędne sferyczne: poziomo pełny obrót,
pionowo od sufitu do podłogi, bez współczynnika rozciągania 1,36 używanego
przez wcześniejszy hol. Osobne wklejki detali i ramek z V125 usunięto.

Panorama została przeliczona do sześciu bezstratnych ścian 2048×2048.
Telefon nie musi wczytywać pojedynczej tekstury szerokiej na 6144 piksele
ani zmniejszać całego holu do swojego limitu GPU. Gdy limit cubemapy jest
niższy niż 2048, aplikacja korzysta z renderera Canvas, zachowując te same
ściany. Renderer Canvas przycina trójkąty na granicach ścian, aby nie
rozciągać jednej tekstury na drugą i nie odsłaniać ciemnych szczelin.

Puste tabliczki w nowej grafice otrzymały siedem napisów i ikon SVG.
Są umieszczone wewnątrz istniejących ramek i podążają za kamerą oraz
polami dotyku. Nie dodano drugiego kompletu paneli ani obwódek.
Sterowanie, ręce, moce, wejścia do pokojów, postępy i działające ekrany
treningów pozostają zachowane. Ruch nadal wykorzystuje dotychczasowy
model spaceru oparty na panoramie; nie powstaje z niego osobny model 3D.

Usunięto 15 zastąpionych ilustracji, łącznie 9 725 742 bajty:

- stare tła hall86, hall88 i hd93/hall88;
- panoramę V119 i obie tekstury V125;
- dziewięć zrzutów z katalogu views118, zastąpionych nowym źródłem.

Usunięto również zależność przycisku wyboru widoku od starego zrzutu
oraz wpisy tych obrazów w pamięci offline. Pozostałe grafiki są używane
przez inne ekrany lub dynamicznie dobierane elementy. Nie utworzono
kolejnego archiwum starych obrazów; poprzednie pliki pozostają w historii Git.

## Weryfikacja

- tests/v126.cjs: 189 pozycji kamery, 9072 zgodne projekcje obrazu i dotyku,
  siedem tabliczek, rzutowanie napisów, podział trójkątów na szwach,
  pełnowymiarowe tekstury GPU i przejście na Canvas przy niskim limicie.
- tests/v126-gpu.py: rzeczywisty shader ES2, osiem pełnych widoków
  obejmujących obrót, szwy, sufit i podłogę. Porównanie z oryginalną sferą:
  średni błąd kanału RGB wynosi 0,59–1,12 w skali 0–255.
- tests/v126-software.cjs: osiem widoków rzeczywistego renderera Canvas
  porównanych z renderem GPU, bez odsłoniętych szczelin między ścianami.
- tests/v124.cjs: zachowane profile, menu V118, przedmioty, animacje,
  książki, rozdziały, zakresy stron i tryby treningu obu dzieci.
- Instalator jest sprawdzany w odizolowanym repozytorium lokalnym:
  V125 → V126, ponowienie, zachowanie własnych zmian i uszkodzona paczka.

Podglądy renderera oraz rzutowania napisów obejrzano lokalnie. Nie wykonano
testu całego interfejsu w przeglądarce ani na telefonie użytkowniczki.
Renderer zachowuje szczegóły obecne w dostarczonym obrazie; nie odtwarza
szczegółów, których nie zawiera źródłowa grafika.
