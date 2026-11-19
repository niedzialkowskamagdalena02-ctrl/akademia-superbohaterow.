# V129 — pełne oryginalne sekwencje ruchów

Wykorzystano wszystkie 303 numerowane klatki z dostarczonych sekwencji pięciu bohaterów oraz powstawania pajęczyn. Identyczne kopie współdzielą jeden plik PNG, przy zachowaniu każdej pozycji w sekwencji. Obrazy nie są przerysowywane, ponownie kompresowane ani zmniejszane. Całość korzysta z 291 różnych oryginalnych plików PNG.

## Pełne sekwencje

| Ruch | Liczba oryginalnych klatek |
|---|---:|
| Zwykły cios Hulka, Kapitana, Iron Mana i Spider-Mana | 11 na rękę |
| Uderzenie Hulka w dół | 13 na rękę |
| Rzut i powrót tarczy | 25 |
| Rzut i powrót młota | 38 |
| Laser Iron Mana | 13 na rękę |
| Wystrzał pajęczyny | 14 na rękę |
| Powstawanie każdej z sześciu pajęczyn | 11 |

Pozostałe ciosy i uderzenie młotem Thora wykorzystują wszystkie dostarczone dla nich obrazy i trzy klatki pośrednie. Nie tworzono nowych ujęć rąk.

## Start i pamięć

Po wejściu do spaceru lub wybraniu rodzaju ruchu przygotowywane są sekwencje tego ruchu dla bieżącego bohatera. Postęp jest widoczny przed włączeniem przycisków. Po przygotowaniu naciśnięcie natychmiast ustawia odtwarzanie; pobieranie efektów nie blokuje pierwszej klatki.

Oryginalne dane PNG są buforowane oddzielnie od obrazów gotowych do wyświetlenia. Odtwarzacz przechowuje początek sekwencji oraz przesuwane okno klatek wokół aktualnego ruchu. Limit danych obrazów po dekodowaniu wynosi 96 MiB, a skompresowanych danych w pamięci 64 MiB. Nie są przygotowywane jednocześnie wszystkie postacie. Te limity dotyczą odtwarzacza rąk, nie całej pamięci przeglądarki.

Usunięto długie postoje na początkowej i końcowej klatce gotowości. W locie młota zachowano 38 ms na klatkę ruchu z dostarczonego APNG; wszystkie 38 pozycji pozostają obecne.

## Zachowany zakres

Widok bazy pozostaje dokładnie z V125, tak jak w V128. Treningi, książki, postępy i dane rodziny są zachowane. Sposób wybierania ruchów pozostaje na razie taki jak w V127/V128; sterowanie gestami jest oddzielnym ustalonym krokiem.

Sprawdzenie obejmuje identyczność PNG ze źródłami, kompletność wszystkich 303 numerowanych klatek, odtwarzanie 19 ruchów i 255 klatek ruchu rąk, natychmiastowe rozpoczęcie gotowego ruchu bez pobierania w obsłudze naciśnięcia, limit pamięci, rzeczywiste podpięcie kontrolera spaceru oraz zachowanie interfejsu treningów i widoku V125. Nie przeprowadzono testu na telefonie użytkowniczki.
