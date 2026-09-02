# TachoGuard Pro

[České README](README.md)

An experimental web application for importing, visualizing, and analyzing data from European tachograph driver cards. The project works with DDD files, displays activity timelines, and provides an indicative compliance analysis based on Regulation (EC) No 561/2006 and AETR.

## Project status

This project is under active development and is intended for testing the parser, analysis engine, and user interface. It is not a certified enforcement tool or legal advice. Results must be verified against the original data and current legislation before practical use.

## Main features

- DDD file import and experimental decoding of card and activity data,
- 24-hour daily timelines and a weekly overview,
- indicative analysis of driving times, breaks, and rest periods,
- possible-infringement overview and inspection report,
- legislation guide,
- fictional sample profiles and test shifts for development without real personal data,
- experimental reader and card insertion or removal status interface.

## Privacy

DDD files contain the driver's name, card number, vehicles, locations, and detailed activity records.

- Never commit real DDD files.
- Do not publish card numbers, certificates, names, or activity records.
- Remove personal information before publishing any output.
- Use fictional test profiles for development.

## Requirements

- Node.js and npm,
- a modern web browser.

Direct browser access to PC/SC readers depends on the operating system and permissions. On macOS, the system PC/SC layer may prevent direct WebUSB access. The most reliable workflow is to create the DDD file with an external tool and then import it into the application.

Experimental companion PC/SC downloader: [tachograph-card-downloader](https://github.com/Cautus76/tachograph-card-downloader)

## Local development

```bash
npm install
npm run dev
```

The development server uses port 3000 by default.

## Checks and build

```bash
npm run lint
npm run build
npm run preview
```

## Environment variables

The `.env.example` file contains placeholders only. Never commit real API keys to the repository.

## Project structure

- `src/components/` – user interface and individual views,
- `src/utils/dddParser.ts` – experimental DDD parser,
- `src/utils/legislationEngine.ts` – analysis rules,
- `src/utils/mockCardData.ts` – fictional test profiles,
- `src/utils/useCardReader.ts` and `webUsbReader.ts` – experimental reader integration,
- `src/types/` – tachograph data types.

## Change overview

A consolidated summary of the changes is available in [CHANGELOG.md](CHANGELOG.md).
