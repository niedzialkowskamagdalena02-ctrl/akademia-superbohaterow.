# V119 — trening i ciągły obrót bazy

Ekran wyboru przedmiotu zajmuje wysokość telefonu. Ma przycisk Wróć obok
tytułu Trenuj, bez dodatkowego nagłówka i menu Akademii. Patryk nie ma już
osobnego kafelka Przedszkole; dobór treści do wieku pozostaje bez zmian.

Ilustracje przedmiotów, kostki, pada, pucharu oraz zakresu książek pochodzą
bezpośrednio z nowych załączników. Oryginały i ich sumy SHA-256 zapisano
w assets/interface119/sources.json. Widoki kadrują te zasoby bez przerysowania
i zachowują proporcje ilustracji. Napisy przy wyborze źródła, trybu i zakresu
są funkcjonalnymi etykietami. Puste książki nie uruchamiają pustego treningu.

Hulk używa oryginalnej grafiki z dostarczonego zrzutu. SVG jest wyłącznie
oknem na niezmienione bajty obrazu: wyklucza pasek telefonu, komunikat
udostępniania i przyciski edytora. Nie zmienia postaci.

Baza ponownie używa ciągłej kamery i panoramy 2:1. Przesuwanie palcem
obraca widok bez przełączania między zdjęciami, a przytrzymanie zachowuje
dotychczasowe chodzenie. Zachowano pomieszczenia, gry, opiekę nad zwierzakiem,
moce bohaterów, aktualną energię i poziom.

Nowe tło hall.png uzupełnia wcześniejszą panoramę o wykończenie pasujące do
finalnych grafik. Powstało przez edycję obrazu: wcześniejszy hol był wzorcem
rozmieszczenia, a załączone Centrum Rozrywki, Sala Treningowa i Kącik zwierzaka
wzorcami materiałów, kolorów i oświetlenia. Polecenie: zachować pozycje wejść
i układ pomieszczeń w pełnej panoramie 2:1, ujednolicić metaliczne powierzchnie
i turkusowe, bursztynowe oraz fioletowe światło; bez interfejsu, dłoni i napisów.

Siedem paneli wejścia to kadry oryginalnych grafik V118, rzutowane wraz
z kamerą. Funkcjonalny obszar obejmuje cały panel i nie pozostaje w miejscu
podczas obrotu. Usunięto aktywną warstwę galerii V118 oraz pływające etykiety
wejść w holu. Nawigacja i pytania pozostają dostępne.

Urządzenia bez WebGL mają renderer Canvas korzystający z tej samej geometrii
i projekcji co WebGL oraz przyciski. Kamera ma taki sam kierunek i pole
widzenia w obu rendererach.

Walidacja: testy v119, v118, v93, v95 i v86 zakończone powodzeniem.
Test v119 obejmuje 217 położeń kamery, projekcję paneli i zgodność renderera
Canvas z kamerą. Sprawdzono oryginalne zasoby, menu Patryka, zakres książek
oraz dostępność nowych plików w pamięci offline.

W przeglądarce w rozmiarach telefonu sprawdzono wszystkie siedem wejść,
powroty, płynny gest kamery, selektor przedmiotów, wybór zakresu, katalog gier
i start sprawdzianu. Środowisko przeglądarki nie udostępniało WebGL, więc
kontrola wizualna bazy korzystała z renderera Canvas. Nie był to test na
fizycznym telefonie Android.

Publikacja jest wykonywana przez aktualizator Termux. Paczka obejmuje V118
i V119, obsługuje aktualizację z V117 lub V118 oraz ponowne uruchomienie V119.
