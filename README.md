# AngHelp

Strona internetowa o języku angielskim.

## Automatyczny generator plików

Wszystkie pliki źródłowe, które mają znaleźć się na stronie, umieszcza się w folderze `public/` lub `src/`.

Pliki z folderu `public/` będą umieszczane na stronie bez zmian.

Pliki w folderze `src/` zawierają samą zawartość danej strony. Inne elementy pliku HTML, takie jak `<head>` i menu nawigacyjne, są dodawane do pliku automatycznie.

Do pliku z folderu `src/` należy dodać komentarz z tytułem strony, w taki sposób: `<!-- @title: tytuł strony -->`. Ten tytuł strony będzie użyty do znacznika `<title>` oraz w menu nawigacyjnym.

Jeżeli w pliku w folderze `src/` znajduje się komentarz `<!-- @no-nav -->`, to do niego nie będzie dodanego menu nawigacyjnego. W tym przypadku znacznik `<body>` będzie miał klasę `no-nav`, którą można użyć do ukrycia przycisku hamburgera w CSS.

Do pliku można dodać dodatkową zawartość stopki, w taki sposób: `<!-- @footer: Autor podcastu: Jan Kowalski -->`.

Do pliku można dodać też klucz: `<!-- @key: 123 --->`. Strony w menu nawigacyjnym są według niego posortowane (rosnąco). Domyślnie wynosi 1000.

### Plik formatu strony

Plik `format.html` jest używany przez generator stron jako schemat, który określa jak wyglądają wyjściowe pliki. Podmieniane teksty:
```
{style.css} -> ścieżka do pliku style.css
{title} -> tytuł strony
{index} -> adres strony głównej
{nav-class} -> klasa znacznika `<body>`, która zależy od obecności menu nawigacyjnego
{nav-top} -> linki do poszczególnych sekcji strony
{nav} -> menu nawigacyjne
{main} -> zawartość strony
{logo}, {logo-b} -> ścieżka do loga strony
{footer} -> stopka strony
```
