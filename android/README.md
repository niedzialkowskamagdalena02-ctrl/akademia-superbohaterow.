# Akademia Android V79

Oddzielna aplikacja `pl.akademia.superbohaterow`, Android 8 lub nowszy.
Otwiera wyłącznie opublikowaną Akademię w swoim WebView. Nie otwiera Custom Tabs
ani aktywności Chrome. Aktualizacje strony i istniejąca synchronizacja V78 pozostają
pod tym samym adresem. Dane aplikacji Android i przeglądarki mają oddzielne magazyny.

Po instalacji na telefonie dziecka należy wybrać **Połącz z mamą** i użyć nowego kodu
z panelu mamy: **Telefony → Kod dla Pawła**. Nowe połączenie zastępuje poprzedni
telefon tego dziecka. Przed zmianą należy pozwolić dotychczasowej aplikacji przy
dostępnym internecie wysłać jego postępy. Nie importujemy tokenu mamy na telefon dziecka.

Głos korzysta z Android SpeechRecognizer i TextToSpeech. Do mikrofonu potrzebna jest
zgoda rodzica/użytkownika. Muszą być dostępne usługa rozpoznawania mowy oraz głosy
polski i angielski. Rozpoznana transkrypcja pomaga w ćwiczeniu, nie jest pomiarem
fonetycznej poprawności wymowy. Brak języka TTS powoduje błąd, nie odczyt polskim
głosem angielskiego słowa. Most głosu używa kanału wiadomości przekazanego tylko
głównej ramce dokładnie określonej domeny HTTPS.

Family Link: **Paweł → Czas korzystania z urządzenia → Limity czasu → Limity
korzystania z aplikacji → Akademia → Bez limitu czasu**. Należy sprawdzić działanie
po wyczerpaniu limitu Chrome na docelowym telefonie. Ustawienia nadzoru mogą wymagać
zgody rodzica na instalację APK spoza Google Play; nie zmieniamy ich automatycznie.

## Budowanie

Potrzebne: JDK 17+, Android SDK platform 35 i build-tools 35.0.0, Python 3.
Nie potrzeba Android Studio ani dodatkowych bibliotek do działania aplikacji.

```sh
python3 android/build_apk.py --platform /sciezka/sdk/platforms/android-35 --build-tools /sciezka/sdk/build-tools/35.0.0 --key /prywatna/sciezka/academy-release.p12 --password-file /prywatna/sciezka/password.txt --output /sciezka/AKADEMIA_ANDROID.apk
```

Aktualizacje APK wymagają tego samego klucza podpisu. Klucz i hasło są przechowywane
prywatnie poza repozytorium. Nie dołączać ich do publicznego Git ani publikacji strony.

## Źródła techniczne

- https://developer.android.com/develop/ui/views/layout/webapps/webview
- https://developer.android.com/reference/android/webkit/WebView#postWebMessage(android.webkit.WebMessage,android.net.Uri)
- https://developer.android.com/reference/android/speech/SpeechRecognizer
- https://developer.android.com/reference/android/speech/tts/TextToSpeech
- https://support.google.com/families/answer/15957417?hl=pl
