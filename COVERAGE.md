# Test coverage

Stand: [7a665db](https://github.com/JanR99/jan-website-react/commit/7a665dbcaca8673f03aac370ab3944e8f69689e3) vom 16.10.2026. Wird nach jedem Push auf `master` neu geschrieben (`.github/workflows/coverage-badges.yml`).

![Frontend coverage](frontend-coverage.svg) ![Backend coverage](backend-coverage.svg)

## Frontend: 17,7 % der Zeilen getestet

546 von 3080 Zeilen mit Code in 123 Dateien unter `src/`; 20 Dateien sind ganz getestet.

| Ordner | Getestet | Dateien ganz getestet |
|---|---:|---:|
| (Wurzel) | 0 % (0/5) | 0 von 1 |
| components | 0 % (0/335) | 0 von 12 |
| components/account | 0 % (0/486) | 0 von 11 |
| components/auth | 11,7 % (31/265) | 1 von 6 |
| components/games | 0 % (0/49) | 0 von 8 |
| components/games/crossword | 5,3 % (15/282) | 1 von 9 |
| components/games/kanji | 21,6 % (24/111) | 1 von 7 |
| components/helper | 80,8 % (21/26) | 0 von 1 |
| components/layout | 0 % (0/17) | 0 von 4 |
| components/travel | 3,9 % (21/532) | 1 von 14 |
| components/ui | 0 % (0/34) | 0 von 5 |
| config | 0 % (0/7) | 0 von 1 |
| controller | 16,4 % (34/207) | 0 von 11 |
| controller/util | 100 % (18/18) | 1 von 1 |
| hooks | 0 % (0/272) | 0 von 14 |
| utils | 88,0 % (382/434) | 15 von 18 |

Je Ordner die Dateien mit Zeilen, die kein Test ausführt (die Zeilen führen in den Code):

<details><summary><b>(Wurzel)</b> – 0 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [App.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/App.tsx) | 0 % (0/5) | ganze Datei |

</details>

<details><summary><b>components</b> – 0 %, 12 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AccountMenu.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/AccountMenu.tsx) | 0 % (0/27) | ganze Datei |
| [Cookbook.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/Cookbook.tsx) | 0 % (0/35) | ganze Datei |
| [CookMode.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/CookMode.tsx) | 0 % (0/47) | ganze Datei |
| [FeedbackDialog.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/FeedbackDialog.tsx) | 0 % (0/23) | ganze Datei |
| [Home.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/Home.tsx) | 0 % (0/23) | ganze Datei |
| [Navbar.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/Navbar.tsx) | 0 % (0/8) | ganze Datei |
| [PrivacyPage.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/PrivacyPage.tsx) | 0 % (0/1) | ganze Datei |
| [RecipeCard.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/RecipeCard.tsx) | 0 % (0/6) | ganze Datei |
| [RecipePage.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/RecipePage.tsx) | 0 % (0/60) | ganze Datei |
| [RecipePrintSheet.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/RecipePrintSheet.tsx) | 0 % (0/24) | ganze Datei |
| [TravelDiary.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/TravelDiary.tsx) | 0 % (0/16) | ganze Datei |
| [TravelFolderPage.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/TravelFolderPage.tsx) | 0 % (0/65) | ganze Datei |

</details>

<details><summary><b>components/account</b> – 0 %, 11 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AccountPage.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/AccountPage.tsx) | 0 % (0/9) | ganze Datei |
| [BackupSection.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/BackupSection.tsx) | 0 % (0/53) | ganze Datei |
| [FavoritesSection.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/FavoritesSection.tsx) | 0 % (0/9) | ganze Datei |
| [FeedbackSection.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/FeedbackSection.tsx) | 0 % (0/42) | ganze Datei |
| [GamesSection.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/GamesSection.tsx) | 0 % (0/16) | ganze Datei |
| [PermissionsPending.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/PermissionsPending.tsx) | 0 % (0/2) | ganze Datei |
| [ProfileSection.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/ProfileSection.tsx) | 0 % (0/94) | ganze Datei |
| [RecipeAdminSection.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/RecipeAdminSection.tsx) | 0 % (0/49) | ganze Datei |
| [RecipeEditor.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/RecipeEditor.tsx) | 0 % (0/61) | ganze Datei |
| [RecipeImageDropzone.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/RecipeImageDropzone.tsx) | 0 % (0/48) | ganze Datei |
| [UsersRolesSection.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/account/UsersRolesSection.tsx) | 0 % (0/103) | ganze Datei |

</details>

<details><summary><b>components/auth</b> – 11,7 %, 5 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AuthContext.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/auth/AuthContext.tsx) | 0 % (0/124) | ganze Datei |
| [AuthDialog.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/auth/AuthDialog.tsx) | 0 % (0/61) | ganze Datei |
| [PasswordResetPage.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/auth/PasswordResetPage.tsx) | 0 % (0/29) | ganze Datei |
| [ProtectedRoute.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/auth/ProtectedRoute.tsx) | 0 % (0/6) | ganze Datei |
| [SessionExpiryNotice.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/auth/SessionExpiryNotice.tsx) | 0 % (0/14) | ganze Datei |

Ganz getestet: [sessionStore.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/auth/sessionStore.ts)

</details>

<details><summary><b>components/games</b> – 0 %, 8 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Confetti.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/Confetti.tsx) | 0 % (0/6) | ganze Datei |
| [CrosswordGame.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/CrosswordGame.tsx) | 0 % (0/3) | ganze Datei |
| [CrosswordStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/CrosswordStatsTable.tsx) | 0 % (0/9) | ganze Datei |
| [GamesPage.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/GamesPage.tsx) | 0 % (0/7) | ganze Datei |
| [KanjiGame.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/KanjiGame.tsx) | 0 % (0/3) | ganze Datei |
| [KanjiMistakesList.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/KanjiMistakesList.tsx) | 0 % (0/3) | ganze Datei |
| [KanjiStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/KanjiStatsTable.tsx) | 0 % (0/13) | ganze Datei |
| [paths.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/paths.ts) | 0 % (0/5) | ganze Datei |

</details>

<details><summary><b>components/games/crossword</b> – 5,3 %, 8 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ActiveClue.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/ActiveClue.tsx) | 0 % (0/1) | ganze Datei |
| [CrosswordBoard.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/CrosswordBoard.tsx) | 0 % (0/199) | ganze Datei |
| [CrosswordClues.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/CrosswordClues.tsx) | 0 % (0/6) | ganze Datei |
| [CrosswordGrid.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/CrosswordGrid.tsx) | 0 % (0/9) | ganze Datei |
| [CrosswordResult.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/CrosswordResult.tsx) | 0 % (0/3) | ganze Datei |
| [CrosswordSetup.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/CrosswordSetup.tsx) | 0 % (0/16) | ganze Datei |
| [KanaKeyboard.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/KanaKeyboard.tsx) | 0 % (0/18) | ganze Datei |
| [puzzles.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/puzzles.ts) | 0 % (0/15) | ganze Datei |

Ganz getestet: [board.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/crossword/board.ts)

</details>

<details><summary><b>components/games/kanji</b> – 21,6 %, 6 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ChooseQuestion.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/kanji/ChooseQuestion.tsx) | 0 % (0/18) | ganze Datei |
| [KanjiFeedback.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/kanji/KanjiFeedback.tsx) | 0 % (0/3) | ganze Datei |
| [KanjiResult.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/kanji/KanjiResult.tsx) | 0 % (0/3) | ganze Datei |
| [KanjiRound.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/kanji/KanjiRound.tsx) | 0 % (0/18) | ganze Datei |
| [KanjiSetup.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/kanji/KanjiSetup.tsx) | 0 % (0/34) | ganze Datei |
| [TypeQuestion.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/kanji/TypeQuestion.tsx) | 0 % (0/11) | ganze Datei |

Ganz getestet: [rounds.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/games/kanji/rounds.ts)

</details>

<details><summary><b>components/helper</b> – 80,8 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [RecipeHelper.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/helper/RecipeHelper.tsx) | 80,8 % (21/26) | [L38–L41](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/helper/RecipeHelper.tsx#L38-L41) · [L54–L55](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/helper/RecipeHelper.tsx#L54-L55) |

</details>

<details><summary><b>components/layout</b> – 0 %, 4 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ErrorBoundary.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/layout/ErrorBoundary.tsx) | 0 % (0/6) | ganze Datei |
| [Footer.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/layout/Footer.tsx) | 0 % (0/5) | ganze Datei |
| [Layout.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/layout/Layout.tsx) | 0 % (0/5) | ganze Datei |
| [PageHeader.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/layout/PageHeader.tsx) | 0 % (0/1) | ganze Datei |

</details>

<details><summary><b>components/travel</b> – 3,9 %, 13 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [leafletMap.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/leafletMap.ts) | 0 % (0/7) | ganze Datei |
| [TravelFolderCard.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelFolderCard.tsx) | 0 % (0/2) | ganze Datei |
| [TravelFolderDialog.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelFolderDialog.tsx) | 0 % (0/60) | ganze Datei |
| [TravelFolderLink.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelFolderLink.tsx) | 0 % (0/2) | ganze Datei |
| [TravelFolderText.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelFolderText.tsx) | 0 % (0/24) | ganze Datei |
| [TravelLightbox.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelLightbox.tsx) | 0 % (0/115) | ganze Datei |
| [TravelLocationMap.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelLocationMap.tsx) | 0 % (0/44) | ganze Datei |
| [TravelLocationPicker.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelLocationPicker.tsx) | 0 % (0/31) | ganze Datei |
| [TravelMap.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelMap.tsx) | 0 % (0/64) | ganze Datei |
| [TravelMonthField.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelMonthField.tsx) | 0 % (0/6) | ganze Datei |
| [TravelPhotoDropzone.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelPhotoDropzone.tsx) | 0 % (0/42) | ganze Datei |
| [TravelPhotoSorter.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelPhotoSorter.tsx) | 0 % (0/90) | ganze Datei |
| [TravelStopsEditor.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/TravelStopsEditor.tsx) | 0 % (0/24) | ganze Datei |

Ganz getestet: [modifierWheelZoom.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/travel/modifierWheelZoom.ts)

</details>

<details><summary><b>components/ui</b> – 0 %, 5 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Avatar.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/ui/Avatar.tsx) | 0 % (0/3) | ganze Datei |
| [BackToTop.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/ui/BackToTop.tsx) | 0 % (0/8) | ganze Datei |
| [Dialog.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/ui/Dialog.tsx) | 0 % (0/17) | ganze Datei |
| [LoadError.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/ui/LoadError.tsx) | 0 % (0/1) | ganze Datei |
| [SpeakButton.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/components/ui/SpeakButton.tsx) | 0 % (0/5) | ganze Datei |

</details>

<details><summary><b>config</b> – 0 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [navigation.tsx](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/config/navigation.tsx) | 0 % (0/7) | ganze Datei |

</details>

<details><summary><b>controller</b> – 16,4 %, 11 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [APIClient.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/APIClient.ts) | 37,9 % (22/58) | [L5](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/APIClient.ts#L5) · [L20–L129](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/APIClient.ts#L20-L129) |
| [BackupController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/BackupController.ts) | 0 % (0/12) | ganze Datei |
| [FavoritesController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/FavoritesController.ts) | 0 % (0/9) | ganze Datei |
| [FeedbackController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/FeedbackController.ts) | 0 % (0/11) | ganze Datei |
| [GamesController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/GamesController.ts) | 0 % (0/18) | ganze Datei |
| [ImageController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/ImageController.ts) | 50,0 % (3/6) | [L9–L11](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/ImageController.ts#L9-L11) |
| [PlaceSearchController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/PlaceSearchController.ts) | 0 % (0/6) | ganze Datei |
| [RecipeController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/RecipeController.ts) | 27,3 % (3/11) | [L14–L27](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/RecipeController.ts#L14-L27) |
| [RoleController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/RoleController.ts) | 0 % (0/11) | ganze Datei |
| [TravelController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/TravelController.ts) | 18,8 % (6/32) | [L41–L107](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/TravelController.ts#L41-L107) |
| [UserController.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/UserController.ts) | 0 % (0/33) | ganze Datei |

</details>

<details><summary><b>controller/util</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ErrorHandler.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/controller/util/ErrorHandler.ts)

</details>

<details><summary><b>hooks</b> – 0 %, 14 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [useCrosswordStats.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useCrosswordStats.ts) | 0 % (0/23) | ganze Datei |
| [useFavorites.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useFavorites.ts) | 0 % (0/35) | ganze Datei |
| [useGameStats.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useGameStats.ts) | 0 % (0/27) | ganze Datei |
| [useHistoryOverlay.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useHistoryOverlay.ts) | 0 % (0/7) | ganze Datei |
| [useJapaneseWords.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useJapaneseWords.ts) | 0 % (0/28) | ganze Datei |
| [useKanjiMistakes.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useKanjiMistakes.ts) | 0 % (0/21) | ganze Datei |
| [useOnline.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useOnline.ts) | 0 % (0/6) | ganze Datei |
| [usePageTitle.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/usePageTitle.ts) | 0 % (0/4) | ganze Datei |
| [useRecipes.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useRecipes.ts) | 0 % (0/24) | ganze Datei |
| [useScrollMemory.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useScrollMemory.ts) | 0 % (0/12) | ganze Datei |
| [useTheme.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useTheme.ts) | 0 % (0/18) | ganze Datei |
| [useTravelFolders.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useTravelFolders.ts) | 0 % (0/28) | ganze Datei |
| [useUnsavedChanges.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useUnsavedChanges.ts) | 0 % (0/11) | ganze Datei |
| [useWakeLock.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/hooks/useWakeLock.ts) | 0 % (0/28) | ganze Datei |

</details>

<details><summary><b>utils</b> – 88,0 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [offlineCache.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/offlineCache.ts) | 0 % (0/5) | ganze Datei |
| [resizeImage.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/resizeImage.ts) | 0 % (0/33) | ganze Datei |
| [speech.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/speech.ts) | 0 % (0/14) | ganze Datei |

Ganz getestet: [appUpdate.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/appUpdate.ts) · [backup.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/backup.ts) · [chance.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/chance.ts) · [crossword.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/crossword.ts) · [feedback.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/feedback.ts) · [historyOverlay.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/historyOverlay.ts) · [kana.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/kana.ts) · [kanjiChoices.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/kanjiChoices.ts) · [kanjiReading.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/kanjiReading.ts) · [recipe.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/recipe.ts) · [recipeFilter.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/recipeFilter.ts) · [retry.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/retry.ts) · [scrollMemory.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/scrollMemory.ts) · [storedFirst.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/storedFirst.ts) · [travel.ts](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/src/utils/travel.ts)

</details>

## Backend: 97,9 % der Zeilen getestet

2302 von 2351 Zeilen mit Code in 114 Dateien unter `backend/src/main/java/`; 95 Dateien sind ganz getestet.

| Ordner | Getestet | Dateien ganz getestet |
|---|---:|---:|
| de/jan/backup | 100 % (233/233) | 2 von 2 |
| de/jan/config | 100 % (254/254) | 12 von 12 |
| de/jan/controller | 100 % (137/137) | 9 von 9 |
| de/jan/controller/requests | 95,1 % (136/143) | 17 von 19 |
| de/jan/controller/response | 100 % (23/23) | 3 von 3 |
| de/jan/exceptions | 92,9 % (13/14) | 4 von 5 |
| de/jan/feedback | 97,4 % (38/39) | 2 von 3 |
| de/jan/feedback/repository | 100 % (46/46) | 1 von 1 |
| de/jan/games | 97,9 % (94/96) | 6 von 8 |
| de/jan/games/repository | 100 % (138/138) | 2 von 2 |
| de/jan/image | 95,4 % (62/65) | 2 von 4 |
| de/jan/mail | 100 % (85/85) | 5 von 5 |
| de/jan/objectify | 87,7 % (50/57) | 0 von 2 |
| de/jan/recipe | 92,5 % (62/67) | 4 von 6 |
| de/jan/recipe/favorites | 100 % (19/19) | 1 von 1 |
| de/jan/recipe/repository | 100 % (126/126) | 1 von 1 |
| de/jan/role | 100 % (35/35) | 4 von 4 |
| de/jan/role/repository | 100 % (79/79) | 1 von 1 |
| de/jan/security | 94,1 % (112/119) | 3 von 5 |
| de/jan/travel | 95,3 % (122/128) | 9 von 12 |
| de/jan/travel/repository | 100 % (230/230) | 1 von 1 |
| de/jan/user | 88,0 % (73/83) | 4 von 6 |
| de/jan/user/repository | 100 % (135/135) | 2 von 2 |

Je Ordner die Dateien mit Zeilen, die kein Test ausführt (die Zeilen führen in den Code):

<details><summary><b>de/jan/backup</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [BackupRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/backup/BackupRepository.java) · [RestoreRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/backup/RestoreRepository.java)

</details>

<details><summary><b>de/jan/config</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [AdminBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/AdminBootstrapConfig.java) · [CorsConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/CorsConfig.java) · [ImageStorageConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/ImageStorageConfig.java) · [ObjectifyConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/ObjectifyConfig.java) · [ObjectifyFilterConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/ObjectifyFilterConfig.java) · [OpenApiConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/OpenApiConfig.java) · [RateLimitFilterConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/RateLimitFilterConfig.java) · [RecipeBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/RecipeBootstrapConfig.java) · [RoleBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/RoleBootstrapConfig.java) · [SecurityConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/SecurityConfig.java) · [TravelBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/TravelBootstrapConfig.java) · [WebConfig.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/config/WebConfig.java)

</details>

<details><summary><b>de/jan/controller</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [BackupController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/BackupController.java) · [FavoritesController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/FavoritesController.java) · [FeedbackController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/FeedbackController.java) · [GamesController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/GamesController.java) · [ImageController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/ImageController.java) · [RecipeController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/RecipeController.java) · [RoleController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/RoleController.java) · [TravelController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/TravelController.java) · [UserController.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/UserController.java)

</details>

<details><summary><b>de/jan/controller/requests</b> – 95,1 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [RecipeRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/RecipeRequest.java) | 92,3 % (24/26) | [L32](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/RecipeRequest.java#L32) · [L50](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/RecipeRequest.java#L50) |
| [TravelStopRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelStopRequest.java) | 61,5 % (8/13) | [L11–L13](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelStopRequest.java#L11-L13) · [L22](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelStopRequest.java#L22) · [L25](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelStopRequest.java#L25) · [L28](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelStopRequest.java#L28) |

Ganz getestet: [ChangePasswordRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/ChangePasswordRequest.java) · [CrosswordResultRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/CrosswordResultRequest.java) · [DeleteAccountRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/DeleteAccountRequest.java) · [FavoriteRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/FavoriteRequest.java) · [FeedbackRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/FeedbackRequest.java) · [KanjiResultRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/KanjiResultRequest.java) · [LoginRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/LoginRequest.java) · [PasswordResetRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/PasswordResetRequest.java) · [RegisterRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/RegisterRequest.java) · [ResetPasswordRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/ResetPasswordRequest.java) · [RoleRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/RoleRequest.java) · [SetRolesRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/SetRolesRequest.java) · [TravelFolderRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelFolderRequest.java) · [TravelFolderTextRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelFolderTextRequest.java) · [TravelPhotoCaptionRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelPhotoCaptionRequest.java) · [TravelPhotoOrderRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/TravelPhotoOrderRequest.java) · [UpdateProfileRequest.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/requests/UpdateProfileRequest.java)

</details>

<details><summary><b>de/jan/controller/response</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ImageUploadResponse.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/response/ImageUploadResponse.java) · [LoginResponse.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/response/LoginResponse.java) · [RestoreResponse.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/controller/response/RestoreResponse.java)

</details>

<details><summary><b>de/jan/exceptions</b> – 92,9 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [GlobalExceptionHandler.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/exceptions/GlobalExceptionHandler.java) | 83,3 % (5/6) | [L24](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/exceptions/GlobalExceptionHandler.java#L24) |

Ganz getestet: [EntityNotFoundException.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/exceptions/EntityNotFoundException.java) · [EntityStateException.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/exceptions/EntityStateException.java) · [UnauthenticatedException.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/exceptions/UnauthenticatedException.java) · [UnauthorizedException.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/exceptions/UnauthorizedException.java)

</details>

<details><summary><b>de/jan/feedback</b> – 97,4 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Feedback.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/feedback/Feedback.java) | 94,7 % (18/19) | [L52](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/feedback/Feedback.java#L52) |

Ganz getestet: [FeedbackDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/feedback/FeedbackDAO.java) · [FeedbackDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/feedback/FeedbackDTO.java)

</details>

<details><summary><b>de/jan/feedback/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [FeedbackRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/feedback/repository/FeedbackRepository.java)

</details>

<details><summary><b>de/jan/games</b> – 97,9 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [CrosswordStats.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/CrosswordStats.java) | 93,8 % (15/16) | [L35](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/CrosswordStats.java#L35) |
| [KanjiStats.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/KanjiStats.java) | 96,0 % (24/25) | [L46](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/KanjiStats.java#L46) |

Ganz getestet: [CrosswordStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/CrosswordStatsDAO.java) · [CrosswordStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/CrosswordStatsDTO.java) · [KanjiMistake.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/KanjiMistake.java) · [KanjiMistakeDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/KanjiMistakeDTO.java) · [KanjiStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/KanjiStatsDAO.java) · [KanjiStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/KanjiStatsDTO.java)

</details>

<details><summary><b>de/jan/games/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [CrosswordStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/repository/CrosswordStatsRepository.java) · [KanjiStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/games/repository/KanjiStatsRepository.java)

</details>

<details><summary><b>de/jan/image</b> – 95,4 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ImageRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/image/ImageRepository.java) | 94,1 % (32/34) | [L76–L77](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/image/ImageRepository.java#L76-L77) |
| [ImageType.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/image/ImageType.java) | 94,1 % (16/17) | [L31](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/image/ImageType.java#L31) |

Ganz getestet: [RecipeImage.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/image/RecipeImage.java) · [RecipeImageDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/image/RecipeImageDAO.java)

</details>

<details><summary><b>de/jan/mail</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [AbstractMailService.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/mail/AbstractMailService.java) · [BrevoMailSender.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/mail/BrevoMailSender.java) · [FeedbackMailService.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/mail/FeedbackMailService.java) · [PasswordResetMailService.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/mail/PasswordResetMailService.java) · [RegistrationMailService.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/mail/RegistrationMailService.java)

</details>

<details><summary><b>de/jan/objectify</b> – 87,7 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [BaseDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/objectify/BaseDAO.java) | 94,4 % (34/36) | [L34](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/objectify/BaseDAO.java#L34) · [L52](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/objectify/BaseDAO.java#L52) |
| [Filter.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/objectify/Filter.java) | 76,2 % (16/21) | [L36](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/objectify/Filter.java#L36) · [L44–L56](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/objectify/Filter.java#L44-L56) |

</details>

<details><summary><b>de/jan/recipe</b> – 92,5 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Recipe.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/Recipe.java) | 96,4 % (27/28) | [L41](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/Recipe.java#L41) |
| [RecipeSeedMarker.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java) | 50,0 % (4/8) | [L23–L25](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java#L23-L25) · [L32–L33](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java#L32-L33) |

Ganz getestet: [RecipeDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/RecipeDAO.java) · [RecipeDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/RecipeDTO.java) · [RecipeSeedMarkerDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/RecipeSeedMarkerDAO.java) · [RecipeTag.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/RecipeTag.java)

</details>

<details><summary><b>de/jan/recipe/favorites</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [FavoritesRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/favorites/FavoritesRepository.java)

</details>

<details><summary><b>de/jan/recipe/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [RecipeRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/recipe/repository/RecipeRepository.java)

</details>

<details><summary><b>de/jan/role</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [Permission.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/role/Permission.java) · [Role.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/role/Role.java) · [RoleDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/role/RoleDAO.java) · [RoleDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/role/RoleDTO.java)

</details>

<details><summary><b>de/jan/role/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [RoleRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/role/repository/RoleRepository.java)

</details>

<details><summary><b>de/jan/security</b> – 94,1 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Authorization.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/Authorization.java) | 78,9 % (15/19) | [L26](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/Authorization.java#L26) · [L57–L60](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/Authorization.java#L57-L60) |
| [RateLimiter.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/RateLimiter.java) | 84,2 % (16/19) | [L29–L30](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/RateLimiter.java#L29-L30) · [L40](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/RateLimiter.java#L40) |

Ganz getestet: [CurrentUserArgumentResolver.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/CurrentUserArgumentResolver.java) · [JwtService.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/JwtService.java) · [LoginRateLimitFilter.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/security/LoginRateLimitFilter.java)

</details>

<details><summary><b>de/jan/travel</b> – 95,3 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [TravelFolder.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelFolder.java) | 97,0 % (32/33) | [L104](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelFolder.java#L104) |
| [TravelPhotoFile.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelPhotoFile.java) | 90,0 % (9/10) | [L33](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelPhotoFile.java#L33) |
| [TravelSeedMarker.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelSeedMarker.java) | 50,0 % (4/8) | [L23–L25](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelSeedMarker.java#L23-L25) · [L32–L33](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelSeedMarker.java#L32-L33) |

Ganz getestet: [TravelFolderDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelFolderDAO.java) · [TravelFolderDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelFolderDTO.java) · [TravelPhoto.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelPhoto.java) · [TravelPhotoDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelPhotoDAO.java) · [TravelPhotoDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelPhotoDTO.java) · [TravelPhotoFileDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelPhotoFileDAO.java) · [TravelSeedMarkerDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelSeedMarkerDAO.java) · [TravelStop.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelStop.java) · [TravelStopDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/TravelStopDTO.java)

</details>

<details><summary><b>de/jan/travel/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [TravelRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/travel/repository/TravelRepository.java)

</details>

<details><summary><b>de/jan/user</b> – 88,0 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [PasswordResetToken.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/PasswordResetToken.java) | 83,3 % (10/12) | [L44](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/PasswordResetToken.java#L44) · [L56](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/PasswordResetToken.java#L56) |
| [User.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/User.java) | 78,9 % (30/38) | [L59–L60](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/User.java#L59-L60) · [L67–L68](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/User.java#L67-L68) · [L97](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/User.java#L97) · [L109](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/User.java#L109) · [L115–L116](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/User.java#L115-L116) |

Ganz getestet: [PasswordResetTokenDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/PasswordResetTokenDAO.java) · [UserAdminDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/UserAdminDTO.java) · [UserDAO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/UserDAO.java) · [UserDTO.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/UserDTO.java)

</details>

<details><summary><b>de/jan/user/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [PasswordResetRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/repository/PasswordResetRepository.java) · [UserRepository.java](https://github.com/JanR99/jan-website-react/blob/7a665dbcaca8673f03aac370ab3944e8f69689e3/backend/src/main/java/de/jan/user/repository/UserRepository.java)

</details>
