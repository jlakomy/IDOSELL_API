- pierwsze 5/6 godzin poświęciłem na usystematyzowanie wiedzy o noed.js i zapoznanie się z technologią express. 
    W tym celu zapoznałem się z kilkoma poradnikami na yt.
- nastepnie około 2/3 godzin zajęło mi stworznie mechanizmu pobierania danych z idoSell. 
    Napotkałem problem z wykorzystaniem do tego odpowiedniego endpointa ostatecznie zdecydowałem się na użycie /api/admin/v7/orders/orders/search
    z parametrem shippmentStatus: "all", aby pobrać wszyskie zamówienia. Nie użyłem zwykłego GETa ze względu na to że
    wymagał on podania konkretnych id produktu.
- stworzenie podstaw kontrolera do pobierania wszystkich zamówień i aktualizacji zamówień ze statusem innym niż "finished", "lost", "false"
    zajęło mi mniej więcej 2 godziny.
- postawienie serwera i routera do obsługi pierwszego zapytania z synchronicacją danych udało się ogarnąć w godzinę
- dodanie endpointów do pobierania zamówienia po id oraz danych w formacie csv z możliwością filtrowania po wartości zamówienia oraz dodanie middleware
    do zabezpieczenia API za pomocą klucza również 2 godziny

Całość zadania nie wliczając mojego przygotowania teoretycznego zajęło mi ok 8/9 godzin.

Do realizacji zadania wykorzystałem moduły: express, mongoose, axios, dotenv, cors, node-cron, csv-stringify

Endpointy:

-POST /orders/sync - ręcznie wywołuje pełną synchronizację z API IdoSell, uruchamiany przy wystartowaniu serwera. 

Zwraca: {
"message": "Pobieranie danych zakończone sukcesem!",
"imported": <liczba zaimportowanych zamówień>
}

-GET /orders/csv - Zwraca wszystkie zamówienia zapisane w MongoDB w formacie CSV. Przyjmuje dwa opcjonalne parametry w querry minWorth i maxWorth, służące do filtrowania zamówień na podstawie ich wartości 

-GET /orders/:id - Zwraca pojedyncze zamówienie z bazy danych po orderId. W bazie danych jako orderId wykorzystałem orderSerialNumber zwracany przez API idoSell


