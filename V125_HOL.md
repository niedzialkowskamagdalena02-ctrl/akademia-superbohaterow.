# V125 — jakość holu i widoku spaceru

Zastępuje powiększoną, posklejaną teksturę V120 nową panoramą z hol.rar.
Wykorzystuje poprawioną gablotę zwierzaka, większe zbliżenia globusa i gablot
oraz siedem osobnych tabliczek wejść. Detale zachowują rozdzielczość źródłową:
renderer pobiera je z osobnej tekstury 2048×2048, zamiast zmniejszać je do
wąskiego fragmentu panoramy i ponownie powiększać podczas spaceru.

Usunięto szerokie, lustrzane mieszanie na styku holu. Brzegi detali mają tylko
krótkie wygładzenie konturu, wnętrze pozostaje nieprzezroczyste. Kompozycja
WebGL używa premultiplikowanego kanału alfa, aby uniknąć ciemnych obwódek.
Wersja Canvas wykorzystuje te same detale i tę samą geometrię.

Pola kliknięć dopasowano do nowych siedmiu wejść. Funkcje pokojów, zwierzak
wybrany przez dziecko, przedmioty, ręce i moce pozostają bez zmian. Klasyczny
model bazy, treningi, ekran profili i dane użytkownika nie są przebudowywane.

Rozdzielczość renderowania wzrosła do rzeczywistej gęstości ekranu, z limitem
4 mln pikseli dla WebGL i 1,5 mln dla Canvas. Stara tekstura V120 (11,7 MB)
została usunięta; stare panoramy V119/V120 nie są już pobierane do cache.
Nowa panorama i detale zajmują razem około 4,4 MB.

## Rzeczywiste parametry źródeł

- Nowa pełna panorama: 1774×887, zapisana bezstratnie w natywnym rozmiarze.
- Plik nazwany Hol_glowny_4096x2048-1.webp: faktycznie 1536×768.
- Panorama_holu_3840.png: 3840×1280, inne, bliższe ujęcie części holu.
- Gablota zwierzaka: detal 755×950 bez nagłówka, dłoni i przycisków Androida.
- Globus: detal 476×476 z ujęcia 3840 px; gabloty: 308×240 i 230×213.
- Tabliczki: siedem detali 782×170 z dostarczonego arkusza.

Nie deklarujemy całego holu jako natywnego 4K. Źródła mają różne kadry;
panoramy 3840 px nie wolno rozciągnąć na cały obrót kosztem brakujących pokoi.
Opis źródeł, kadry i sumy SHA-256: assets/hq/panorama125/sources.json.

## Weryfikacja

- tests/v125.cjs: 189 pozycji kamery, 9072 zgodne projekcje obrazu i dotyku,
  siedem wejść, natywne detale WebGL/Canvas, czyszczenie detali po wyjściu
  z holu, mały limit uniformów GPU, budżet rozdzielczości i pliki offline.
- tests/v125-gpu.py: rzeczywiste shadery obu wariantów kompilowane i renderowane
  w EGL ES2; 48 próbek RGB/alfa, również przy krawędziach detali, porównanych
  z niezależnym odczytem pikseli źródłowych.
- tests/v124.cjs: zachowane menu V118, przedmioty i animacje, profile oraz
  wybór książek, rozdziałów, stron i trybów dla obu dzieci.
- Instalator: sprawdzana instalacja V124 → V125, ponowienie, zachowanie
  lokalnych zmian i odrzucenie uszkodzonej paczki w izolowanym repozytorium.

Nie wykonano testu wyglądu w przeglądarce ani na telefonie użytkowniczki.
Testy GPU sprawdzają renderer, a nie układ całej aplikacji w przeglądarce.
