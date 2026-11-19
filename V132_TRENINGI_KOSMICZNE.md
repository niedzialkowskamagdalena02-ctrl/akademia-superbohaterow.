# V132 — Ortografia i Dyktando w treningach

Podmieniono dwa istniejące treningi języka polskiego według paczek Kosmiczna_Ortografia i Kosmiczne_Dyktando. Przeczytano oba pliki TXT i oba Podglad.html; kompozycja korzysta z dostarczonej makiety Wzor_Dyktando.webp.

## Oprawa i obsługa

- Granatowe tło, złoty tytuł, astronauta, robot, tor z rakietą, gwiazdami i skrzynią. Pole tekstowe, przyciski, etykiety i stany są działającym interfejsem.
- Dziewięć grafik z obu paczek jest identycznych. Gry współdzielą jeden zestaw zachowany bajt w bajt. Rakieta przezroczysta lata po torze; drugi dostarczony wariant zdobi tytuł. Wzór i zrzut poprzedniego ekranu służą jako referencje.
- Dyktando pozostaje samodzielnym zapisem całego usłyszanego wyrazu. Przed odpowiedzią ekran nie pokazuje dyktowanego słowa. Działa formularz z zatwierdzaniem Enterem oraz polskimi znakami, także w zapisie Unicode z łączonymi znakami.
- Ortografia zachowuje luki i oryginalne odpowiedzi. Kolejne wyrazy przechodzą przez bramy, naprawę nadajnika i lądowanie. Nadajnik obsługuje przeciąganie lub wybór litery i stuknięcie w lukę. Po dwóch błędach pokazuje wskazówkę dotyczącą konkretnego wyrazu; po trafieniu poprawny zapis i odpowiedni efekt ruchu.
- Odsłuch korzysta z obecnej funkcji głosowej; stan mowy steruje falą przy robocie. Pomoc tekstowa i mikrofon prowadzą do istniejącego nauczyciela AI. Mikrofon jest obok pomocy, w normalnym układzie strony.
- Pauza, powrót i pomijanie pozostają dostępne. Pominięcie jest oznaczone i nie daje zaliczenia. Pełna misja zapisuje osobno dla dziecka zadania, wpis, wynik i bieżący etap; mieszanka treningowa zachowuje swój dotychczasowy przebieg.
- Bank wyrazów, porównywanie odpowiedzi i naliczanie nagród pozostają w obecnym silniku treningów. Podsumowanie pokazuje rzeczywiście wypłacone złote; nie dodano przykładowego combo.

## Zakres i zasoby

Nowa oprawa dotyczy wskazanych dwóch treningów polskiego. Pozostałe gry, sprawdziany i materiały książkowe korzystają ze swoich dotychczasowych ekranów. Widok holu i wszystkie grafiki oraz klatki dłoni pozostały zachowane.

Audyt zależności wykazał 730 używanych grafik i zero nieużywanych. Zastąpiony ekran był wspólnym interfejsem wielu ćwiczeń, więc jego zasoby nadal są potrzebne innym grom. Do zasobów dodano tylko dziewięć plików potrzebnych do działania; nie kopiowano podglądów HTML ani ilustracji referencyjnych. Sumy kontrolne oryginałów zawiera scripts/space132-assets.json.

## Sprawdzenie

- tests/v132.cjs: rzeczywisty silnik treningu w modelu DOM; formularz, polskie znaki, ukrycie odpowiedzi dyktanda, odsłuch, pauza i wznowienie z zapisu, pominięcia, pojedyncza wypłata, ścieżka AI i mikrofonu, odrzucenie spóźnionej wypowiedzi, trzy etapy ortografii, wskazówka po dwóch błędach, przeciąganie i anulowanie, oryginalne bajty grafik.
- tests/v82.cjs: 138 kontroli obecnych mechanik, mentora i źródeł zadań.
- tests/rewards82.cjs: 17 kontroli wypłat i zapisu portfela.
- Bieżące kontrole V124, V125, V130, V131 i zakresu V129: nawigacja treningów, zasoby offline, pozostałe gry, poprawki dłoni, dokładny hol V125 i wszystkie 303 pozycje klatek.
- Kontrola zależności zasobów i składni kodu zakończona poprawnie.

Historyczny tests/v95.cjs odwołuje się do modułu hangar-boarding97.js usuniętego w V130, więc nie uruchamia się w obecnym projekcie. Aktualne gry hangaru sprawdzają tests/v130.cjs oraz tests/v131-baggage-ui.cjs.

Testy zdarzeń i logiki nie są testem renderowania ani klawiatury w prawdziwej przeglądarce telefonu. Głos systemowy, dostęp do mikrofonu i usługa AI zależą od telefonu, uprawnień i połączenia.
