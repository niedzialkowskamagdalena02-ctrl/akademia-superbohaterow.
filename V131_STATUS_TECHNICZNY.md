# V131 — stan roboczy, bez publikacji

## Zastosowane poprawki

- Widoczny przycisk powrotu do wyboru widoku, niezależny od błędnego wycinka ilustracji; osobny powrót do poprzedniego pokoju.
- Krzyżyk zamykania dolnej instrukcji. Preferencja jest pamiętana osobno dla każdego dziecka.
- Tymczasowe udostępnienie sieci i lasera profilom obu dzieci bez zmiany portfela lub zakupionych przedmiotów.
- Błysk zwykłego ciosu przypisany do pięści z aktualnie wyświetlanej klatki. Smuga ma rozmiar zależny od dłoni i obraca się zgodnie z jej ruchem.
- Zabezpieczenie przed przejściem z wejścia do samolotu od razu na kafelek gry przez ten sam gest. Najpierw otwiera się menu kokpitu.
- Usunięty powtórny wybór poziomu na karcie lotu; dane wyboru z wcześniejszego ekranu pozostają aktywne.
- Karta pasażera pokazuje pełne zdanie i czyta je po wybraniu postaci. Na ekranie są także pozostałe istniejące grafiki zwierząt jako opcje wyboru.
- W obręczach przywrócony mechanizm lotu sprzed V130; dźwignia jest częścią dolnego panelu kokpitu.
- W balonach lekko większy samolot, niewielkie ruchome chmury w tle i brak dolnych przycisków sterowania. Stuknięcie samolotu strzela, przeciąganie steruje bez oddania przypadkowego strzału.
- Polski syntezator otrzymuje tekst „razy” zamiast znaku mnożenia. Zmiana dotyczy odczytu; wyświetlane działania zachowują symbole.
- Usunięto osiem zastąpionych plików graficznych i przywrócono jeden oryginalny element starszego kokpitu. Nie zmieniono bajtów grafik rąk. Aktualne zasoby opisuje `scripts/hangar131-assets.json`, a usunięte `scripts/hangar131-removed.json`.

## Część niezastosowana

Jedna operacja zmieniająca nazewnictwo oraz reguły i zakres zadań odprawy została zablokowana przez filtr narzędzia. Nie podano powodu. Ta operacja nie została powtórzona ani zastosowana inną drogą. Plik danych zadań pozostaje identyczny jak w V130. W szczególności nie należy traktować żądanych zmian tej części jako ukończonych.

Zgodnie z prośbą użytkowniczki nie przygotowano tej częściowo ukończonej aktualizacji jako gotowej paczki do publikacji i nie opublikowano jej na GitHubie.

## Testy

- `node tests/v131.cjs` — odczyt mnożenia w prawdziwej funkcji syntezy, uprawnienia profili, pamięć zamykania instrukcji, zabezpieczenie wejścia do kokpitu, brak powtórnego wyboru poziomu, karta i odczyt pasażera, odróżnienie tapnięcia samolotu od przeciągania.
- `node tests/v130.cjs` — oba poziomy czterech gier, zapis postępu, poprawne/błędne odpowiedzi, sterowanie, powroty, 40 aktualnych zasobów i usunięte pliki.
- `node tests/v130-gestures.cjs` — rozpoznawanie pojedynczego/podwójnego stuknięcia i gestów dłoni.
- `node tests/v130-wind.cjs` — 208 ustawień w pionie i poziomie, w każdym kontrola pikseli smugi i błysku przy pięści.
- `node tests/v129.cjs` — 291 niezmienionych PNG, wszystkie 19 ruchów i 255 klatek głównych animacji, przygotowanie ruchów do gestów, budżet pamięci i kontroler dotyku na natywnych płótnach.
- Kontrole V124, V125 i V129 zakresu — istniejące treningi, hol i wszystkie 303 dostarczone pozycje klatek zachowane.
- Kontrola zależności zasobów i CSS zakończona bez brakujących lub nieużywanych plików graficznych.

Są to testy logiki, zdarzeń, zasobów i natywnego rysowania, a nie pomiar działania w przeglądarce telefonu.
