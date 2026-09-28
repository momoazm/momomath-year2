/** Year-2 SYLLABUS — German (beginner, ages 6-7), EXTRACTED FROM REAL
 *  PUBLISHED BOOKS (PLAN 143). Three sources, unioned at load:
 *
 *  1. "Deutsch mit Felix und Franzi" — Goethe-Institut London, Lessonplan
 *     Volume 1 + 2, the unit "The words needed" tables. THIS IS THE COURSE the
 *     german units follow ("Hallo, Felix!", "Frau und Herr", ...).
 *     https://www.goethe.de/resources/files/pdf39/Lessonplan_Volume1.pdf
 *     https://www.goethe.de/resources/files/pdf39/Lessonplan_Volume2.pdf
 *  2. "Wortliste" for Goethe-Zertifikat A1 / Start Deutsch 1 (pp. 9-27),
 *     Goethe-Institut — the published A1 word list (~650 headwords).
 *     https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf
 *  3. "Wortliste Grundwortschatz NRW" (Grundschule word list), QUA-LiS NRW —
 *     the primary-school word list (noun/picture column + colours/numbers).
 *     https://www.qua-lis.nrw.de/system/files/media/document/file/wortliste-grundwortschatz-nrw.pdf
 *  Extracted 2026-09-27, verified against the source PDFs.
 */

const FELIX_FRANZI_RAW = `hallo|tschüss|frau|herr|briefkasten|zoo|schlecht|wunderbar|krank|fast|
viele|hund|katze|biene|krokodil|pferd|elefant|schaf|hahn|laut|leise|schnell|
langsam|tanzen|stop|eule|henne|ziege|esel|küken|giraffe|löwe|maus|vogel|groß|
klein|hier|da|überall|blau|rot|grün|schwarz|grau|rosa|gelb|lila|weiß|gold|bunt|
braun|regenbogen|und|ja|nein|deutschland|österreich|schweiz|liechtenstein|
luxemburg|orange|banane|apfel|birne|ananas|danke|bitte|obstsalat|oben|unten|
zitrone|pflaume|erdbeere|hose|pullover|jacke|schal|kleid|rock|hut|schuhe|
kaputt|socken|handschuhe|mantel|stiefel|hemd|bluse|gürtel|trikot|brot|brötchen|
butter|wurst|marmelade|käse|obst|toast|milch|schokolade|saft|wasser|tee|kaffee|
lecker|hände|nase|augen|ohren|finger|arme|füße|knie|mund|bauch|schultern|kopf|
rücken|po|kinder|warm|heiß|kalt|eiskalt|sonnenbrille|regen|regenschirm|nass|
schön|wetterfrosch|tragen|monate|januar|februar|märz|april|mai|juni|juli|august|
september|oktober|november|dezember|jahreszeiten|frühling|sommer|herbst|winter|
schwimmen|einkaufen|singen|nikolaus|schuh|nüsse|lebkuchen|bonbons|feiern|
luftschlangen|kostüm|maske|krapfen|handy|telefon|null|lied|super|wählen|plus|
minus|wochentage|montag|dienstag|mittwoch|donnerstag|freitag|sonntag|malen|
fahrrad|spiel|oma|opa|tante|onkel|geburtstag|höher|niedriger|zuhören|lesen|
deutsch|englisch|sport|musik|religion|pause|schulschluss|hausaufgaben|gleich|
geradeaus|springen|hell|dunkel|küche|wohnzimmer|schlafzimmer|kinderzimmer|keller|
regal|flur|dach|garten|lampe|märchen|räuber|kino|rathaus|schwimmbad|schloss|
park|supermarkt|bahnhof|kirche|straße|links|rechts|abbiegen|minuten|vor|nach|
schüssel|löffel|ofen|backen|weihnachten|schneemann|weihnachtsbaum|geschenk|
geburtstag|kuchen|kerzen|kekse|messer|schere|schwein|vier|fünf|sechs|sieben|
acht|neun|zehn|elf|zwölf|zehn|klasse|schule|lehrer|stunde|pause|freund|
freundin|buch|stift|heft|tasche|uhr|wort|satz|frage|wortspiel|zunge|buchstabe|
alphabet|buchstabieren|hören|sprechen|singen|malen|basteln|turnen|schwimmen|
klettern|werfen|fangen|laufen|hüpfen|sitzen|stehen|gehen|kommen|springen|
dürfen|müssen|können|sollen|mögen|will|heißen|sein|bleiben|geben|nehmen|
machen|sehen|hören|riechen|schmecken|denken|wissen|glauben|finden|suchen|zeigen|
zeichnen|rechnen|zählen|vergleichen|ordnen|messe|wiegen|temperatur|wetter|
wind|wolke|nebel|eis|schnee|hitze|kälte|jahreszeit|monat|woche|tag|stunde|
minute|sekunde|heute|gestern|morgen|übermorgen|woche|wochenende|urlaub|ferien|
reise|koffer|flughafen|flugzeug|zug|bus|bahn|taxi|fahrrad|auto|boot|schiff|
straße|weg|brücke|kreuzung|ampel|zebra|verkehr|unfall|regeln|fahrkarte|`

const GOETHE_A1_RAW = `aber|abfahren|abfahrt|abgeben|abholen|absender|achtung|adresse|all|allein|
also|alt|alter|an|anbieten|angebot|ander|anfangen|anfang|anklicken|ankommen|
ankunft|ankreuzen|anmachen|anmelden|anmeldung|anrede|anrufen|anruf|antworten|
antwort|anzeige|anziehen|apartment|apfel|appetit|arbeiten|arbeit|arbeitslos|
arbeitsplatz|arm|arzt|auch|auf|aufgabe|aufhören|aufstehen|aufzug|auge|aus|
ausflug|ausfüllen|ausgang|auskunft|ausland|ausländer|ausländisch|ausmachen|
aussage|aussehen|aussteigen|ausweis|ausziehen|auto|autobahn|automat|automatisch|
baby|bäckerei|bad|baden|bahn|bahnhof|bahnsteig|bald|balkon|banane|bank|bar|
bauch|baum|beamte|bedeuten|beginnen|bei|beide|bein|beispiel|bekannt|bekommen|
benutzen|beruf|besetzt|besichtigen|besser|best|bestellen|besuchen|bett|bezahlen|
bier|bild|billig|birne|bis|bisschen|bitte|bitten|bitter|bleiben|bleistift|blick|
blume|bogen|böse|brauchen|breit|brief|briefmarke|bringen|brot|brötchen|bruder|
buch|buchstabe|buchstabieren|bus|butter|chef|computer|da|dame|daneben|danken|
dank|danke|dann|datum|dauern|dein|denn|der|dich|dies|dir|disco|doktor|dorf|
dort|draußen|drucken|drucker|drücken|durch|dürfen|durst|duschen|dusche|ecke|
ehefrau|ehemann|ei|eilig|ein|einfach|eingang|einkaufen|einladen|einladung|
einmal|einsteigen|eintritt|email|empfänger|empfehlen|enden|ende|entschuldigen|
entschuldigung|er|ergebnis|erklären|erlauben|erwachsene|erzählen|es|essen|
euer|fahren|fahrer|fahrkarte|fahrrad|falsch|familie|familienname|farbe|feier|
feiern|fehlen|fehler|fernsehen|fertig|feuer|fieber|film|finden|firma|fisch|
flasche|fleisch|fliegen|abflug|flughafen|flugzeug|formular|foto|fragen|frage|
frau|frei|freizeit|fremd|freuen|freund|früher|frühstücken|frühstück|für|fuß|
fußball|garten|gast|geben|geboren|geburtstag|gefallen|gegen|gehen|gehören|geld|
gemüse|gepäck|gerade|geradeaus|geschäft|geschenk|gespräch|gestern|getränk|
gewicht|gewinnen|glas|glauben|gleich|gleis|glück|glücklich|glückwunsch|
gratulieren|groß|größe|großmutter|großvater|gruppe|gruß|gut|haar|haben|
hallo|halten|haltestelle|hand|haus|hausaufgabe|heimat|heiraten|heißen|helfen|
hell|herd|herr|heute|hier|hilfe|hinten|hobby|hoch|holen|hören|hotel|hund|
hunger|ich|immer|in|information|ja|jacke|jed|jetzt|job|jung|junge|kaffee|
kaputt|karte|kartoffel|kasse|kaufen|kein|kennen|kind|kino|klar|klasse|kleidung|
klein|kochen|koffer|kollege|kommen|können|konto|kopf|kosten|krank|küche|kuchen|
kugelschreiber|kühlschrank|kunde|kurs|kurz|lachen|laden|land|lang|lange|langsam|
laufen|laut|leben|legen|lehrer|leicht|leider|leise|lernen|lesen|licht|lieb|
lieben|lieber|lied|liegen|links|lösung|lustig|machen|mädchen|man|mann|
maschine|meer|mehr|mein|mensch|milch|mit|mitbringen|mitkommen|mitmachen|
mitnehmen|mitte|möchten|mögen|möglich|moment|morgen|müde|mund|müssen|mutter|
nach|name|nehmen|nein|neu|nicht|nichts|nie|noch|normal|nummer|nur|oben|obst|
oder|öffnen|oft|ohne|oma|opa|ordnung|ort|papier|partner|party|pass|pause|plan|
platz|polizei|post|preis|problem|prüfung|raum|rechnung|rechts|regnen|reis|
reisen|reise|restaurant|richtig|riechen|ruhig|saft|sagen|salat|salz|satz|
schalter|scheinen|schicken|schild|schlafen|schlecht|schließen|schluss|schlüssel|
schmecken|schnell|schon|schön|schrank|schreiben|schuh|schule|schüler|schwer|
schwester|schwimmen|schwimmbad|see|sehen|sehr|sein|seit|sich|sie|sitzen|so|
sofa|sofort|sohn|sollen|sonne|spät|später|spielen|sport|sprache|sprechen|stadt|
stehen|stelle|stellen|stock|straße|studieren|stunde|suchen|tanzen|tasche|taxi|
tee|teil|telefonieren|telefon|termin|test|teuer|text|thema|tisch|tochter|
toilette|tomate|tot|treffen|treppe|trinken|tschüss|tun|über|uhr|und|unser|
unten|unter|unterschreiben|unterschrift|urlaub|vater|verboten|verein|verkaufen|
verstehen|viel|vielleicht|von|vor|vorsicht|vorstellen|wandern|wann|warten|
warum|was|waschen|wasser|wein|weit|weiter|welt|wenig|wer|werden|wetter|
wichtig|wie|wiederholen|wiedersehen|willkommen|wind|wir|wissen|wo|woher|wohin|
wohnen|wohnung|wollen|wort|wunderbar|zahlen|zeit|zeitung|zimmer|zu|zufrieden|
zug|zurück|zusammen|zwischen`

const NRW_RAW = `abend|advent|affe|afrika|amerika|angst|apfel|arzt|asien|auge|australien|auto|
ball|banane|baum|beispiel|berg|bett|birne|boot|brief|brot|bruder|buch|burg|bus|
chor|computer|detektiv|dieb|dienstag|donnerstag|dose|durst|ei|eimer|eis|elefant|
eltern|erdbeere|ergebnis|eule|europa|fahrrad|ferien|fernseher|feuerwehr|fisch|
flasche|flugzeug|freitag|freund|frühstück|fuchs|fuß|gabel|geburt|geschichte|
gewitter|giraffe|glück|gruppe|haar|hand|handy|hase|haus|heft|hexe|hose|hummel|
hund|hunger|idee|jacke|jahr|junge|karten|käse|katze|kind|kirche|kirsche|klasse|
knopf|kopf|korb|kreuz|küche|kuh|laub|lehrer|löffel|löwe|mama|mann|mappe|maus|
meer|messer|milch|minute|mittag|mond|montag|mund|mutter|mütze|nachbar|nachmittag|
nase|nashorn|nest|note|oma|opa|papa|papagei|pappe|pferd|pflanze|pflaster|pinsel|
platz|puppe|rauch|regen|rettung|rock|sache|samstag|schaf|schal|schaufel|schaukel|
schiff|schloss|schmetterling|schnee|schnupfen|schrank|schule|schwein|see|seite|
sonne|sonntag|spaß|spiegel|spinne|sport|stadt|stein|stern|straße|stück|stunde|
tafel|tag|tasche|tasse|teller|tisch|tod|treppe|uhr|uhu|urlaub|vater|vogel|wald|
wasser|weg|weihnachten|welt|wolke|zahn|zeit|ziege|zitrone|zoo|zug|drei|eins|
gelb|mittwoch|schwarz|vier|weiß|zwei|rosa|lila|braun|orange|grün|blau|rot|
gold|bunt|farbe|farben|wetter|schwester|bruder|eltern|familie|haus|zimmer|
schule|freunde|spielzeug|fahrrad|hose|schuhe|jacke|wetter|himmel|erde|blume|
tier|tiere|vogel|fisch|katze|maus|hund|pferd|kuh|schaf|hahn|ente|eule|bär|
 löwe|affe|elefant|affe`

/** PLAN 145 — extraction-gap backfill: course words the german units teach
 *  (the units follow "Deutsch mit Felix und Franzi"; Frosch is one of the
 *  course regulars, cf. src/content/german/helpers.ts) plus unit-topic words
 *  missing from the three PLAN-143 source extractions. */
const BACKFILL_RAW = `frosch|lieblingsfarbe|traube|trauben|froh|entschuldigung|geliebt`

export const GERMAN_SYLLABUS: readonly string[] = Array.from(
  new Set(
    [FELIX_FRANZI_RAW, GOETHE_A1_RAW, NRW_RAW, BACKFILL_RAW]
      .flatMap((raw) => raw.split('|'))
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean),
  ),
)

export const GERMAN_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'felix', 'franzi', 'deutsch', 'engels',
  // English glosses the units deliberately show next to the German
  // (food/country translations in g7 fruit + g3 My-land units) (PLAN 145)
  'strawberry', 'strawberries', 'switzerland',
]
