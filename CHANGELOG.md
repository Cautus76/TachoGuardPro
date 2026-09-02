# Přehled změn / Change overview

Tento dokument shrnuje dodanou historii úprav z Google AI Studia a ověřenou strukturu aktuálního zdrojového kódu. Nejde o automaticky generovaný seznam jednotlivých Git commitů.

This document summarizes the supplied Google AI Studio action history and the verified structure of the current source code. It is not an automatically generated commit-by-commit log.

## Čeština

### Časové osy a testovací data

- Generování denních činností bylo přepracováno na sekvenční bloky počítané po minutách.
- Ukázkové pracovní dny mají odlišné směny, jízdy, práci, pohotovost, přestávky a odpočinky.
- Nepracovní dny bez řízení a práce se vyhodnocují jako volno nebo odpočinek a nemají vytvářet přestupky.
- Testovací profily jsou výslovně označené jako ukázková data.

### Analytický motor

- Výpočet nepřetržité doby řízení rozlišuje řízení, jinou práci, pohotovost, přestávku a odpočinek.
- Byla doplněna podpora plných a dělených bezpečnostních přestávek.
- Denní odpočinek může plynule pokračovat přes půlnoc a navazující části se vyhodnocují společně.
- Kontrola denního odpočinku pracuje s 24hodinovým oknem od začátku směny.
- Byla zpřesněna pravidla pro dny bez řízení a pro návaznost mezi kalendářními dny.

### Parser DDD a datové typy

- Parser byl rozšířen o podrobnější zpracování identifikace karty a bloků aktivit.
- Byly doplněny záložní postupy pro rozpoznání textových údajů a standardních formátů čísel karet.
- Datové typy tachografu byly rozšířeny pro další analytické a protokolové údaje.
- Import skutečného souboru DDD je oddělen od smyšlených ukázkových profilů.

### Čtečka a stav karty

- Rozhraní rozlišuje připojení čtečky, vloženou kartu, vyjmutou kartu a offline prohlížení již načtených dat.
- Byl doplněn živý stavový panel a diagnostické zobrazení čtečky.
- Stav fyzické karty ve čtečce je oddělen od historického stavu karty v tachografu vozidla.
- Webová hardwarová integrace zůstává experimentální a závisí na možnostech prohlížeče a operačního systému.

### Uživatelské rozhraní a dokumentace

- Byly upraveny přehledy, kontrolní protokol a průvodce legislativou.
- Aplikace nabízí denní a týdenní pohled, seznam možných přestupků a kontrolní výstupy.
- Dodaná historie uvádí opakované úspěšné sestavení projektu po provedených úpravách.

## English

### Timelines and test data

- Daily activity generation was reworked into sequential minute-based blocks.
- Sample working days now use distinct shifts, driving, work, availability, breaks, and rest periods.
- Non-working days with no driving or work are treated as time off or rest and should not produce infringements.
- Test profiles are explicitly identified as sample data.

### Analysis engine

- Continuous-driving calculations distinguish driving, other work, availability, breaks, and rest.
- Full and split safety breaks are supported.
- Daily rest can continue across midnight, with adjacent portions evaluated together.
- Daily-rest checks use a 24-hour window starting with the beginning of a shift.
- Rules for non-driving days and continuity between calendar days were refined.

### DDD parser and data types

- The parser was expanded with more detailed card-identification and activity-block handling.
- Fallback detection was added for text data and common card-number formats.
- Tachograph data types were extended for additional analysis and reporting fields.
- Real DDD imports are separated from fictional sample profiles.

### Reader and card status

- The interface distinguishes reader connection, card insertion, card removal, and offline viewing of previously loaded data.
- A live status panel and reader diagnostics were added.
- The physical card state in the reader is separated from the historical tachograph-slot status.
- Browser hardware integration remains experimental and depends on browser and operating-system capabilities.

### User interface and documentation

- Overview, inspection-report, and legislation-guide views were refined.
- The application provides daily and weekly views, possible-infringement lists, and inspection outputs.
- The supplied action history reports repeated successful project builds after the changes.
