# TachoGuard Pro

[English README](README_EN.md)

Experimentální webová aplikace pro import, vizualizaci a analýzu dat z evropských tachografových karet řidiče. Projekt pracuje se soubory DDD, zobrazuje časové osy činností a poskytuje orientační kontrolu pravidel podle nařízení (ES) č. 561/2006 a AETR.

## Stav projektu

Projekt je ve vývoji a slouží k testování parseru, analytického motoru a uživatelského rozhraní. Nejde o certifikovaný kontrolní nástroj ani právní poradenství. Výsledky musí být před praktickým použitím ověřeny proti originálním datům a aktuální legislativě.

## Hlavní funkce

- import souborů DDD a experimentální dekódování údajů karty a aktivit,
- 24hodinové denní časové osy a týdenní přehled,
- orientační analýza dob řízení, přestávek a odpočinků,
- přehled možných přestupků a kontrolní protokol,
- průvodce legislativními pravidly,
- ukázkové profily a testovací směny pro vývoj bez skutečných osobních dat,
- experimentální rozhraní pro stav čtečky a vložení nebo vyjmutí karty.

## Ochrana osobních údajů

DDD soubory obsahují jméno řidiče, číslo karty, vozidla, místa a podrobné záznamy činností.

- Nikdy necommitujte skutečné soubory DDD.
- Nezveřejňujte čísla karet, certifikáty, jména ani záznamy aktivit.
- Před zveřejněním výstupů vždy odstraňte osobní údaje.
- Pro vývoj používejte pouze smyšlené testovací profily.

## Požadavky

- Node.js a npm,
- moderní webový prohlížeč.

Přímý přístup webového prohlížeče k PC/SC čtečkám závisí na operačním systému a oprávněních. Na macOS může systémová PC/SC vrstva blokovat přímý přístup přes WebUSB. Nejspolehlivější pracovní postup je vytvořit DDD externím nástrojem a následně jej importovat do aplikace.

Experimentální doprovodný PC/SC downloader: [tachograph-card-downloader](https://github.com/Cautus76/tachograph-card-downloader)

## Lokální spuštění

```bash
npm install
npm run dev
```

Vývojový server standardně běží na portu 3000.

## Kontrola a sestavení

```bash
npm run lint
npm run build
npm run preview
```

## Proměnné prostředí

Soubor `.env.example` obsahuje pouze zástupné hodnoty. Skutečné API klíče nikdy neukládejte do repozitáře.

## Struktura projektu

- `src/components/` – uživatelské rozhraní a jednotlivé přehledy,
- `src/utils/dddParser.ts` – experimentální parser DDD,
- `src/utils/legislationEngine.ts` – analytická pravidla,
- `src/utils/mockCardData.ts` – smyšlené testovací profily,
- `src/utils/useCardReader.ts` a `webUsbReader.ts` – experimentální integrace čtečky,
- `src/types/` – datové typy tachografu.

## Přehled změn

Souhrn dosavadních úprav je v souboru [CHANGELOG.md](CHANGELOG.md).
