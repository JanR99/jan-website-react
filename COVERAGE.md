# Test coverage

Stand: [7ec8fb4](https://github.com/JanR99/jan-website-react/commit/7ec8fb43d5268451800d5ea047474fc2a8ca650b) vom 29.10.2026. Wird nach jedem Push auf `master` neu geschrieben (`.github/workflows/coverage-badges.yml`).

![Frontend coverage](frontend-coverage.svg) ![Backend coverage](backend-coverage.svg)

## Frontend: 18,5 % der Zeilen getestet

622 von 3370 Zeilen mit Code in 154 Dateien unter `src/`; 27 Dateien sind ganz getestet.

| Ordner | Getestet | Dateien ganz getestet |
|---|---:|---:|
| (Wurzel) | 0 % (0/5) | 0 von 1 |
| components | 0 % (0/350) | 0 von 15 |
| components/account | 0 % (0/475) | 0 von 13 |
| components/auth | 9,3 % (31/332) | 1 von 7 |
| components/games | 0 % (0/79) | 0 von 14 |
| components/games/crossword | 5,4 % (15/279) | 1 von 9 |
| components/games/kana | 0 % (0/44) | 0 von 3 |
| components/games/kanji | 14,1 % (12/85) | 1 von 5 |
| components/helper | 80,8 % (21/26) | 0 von 1 |
| components/layout | 0 % (0/18) | 0 von 4 |
| components/travel | 4,0 % (21/519) | 1 von 14 |
| components/ui | 0 % (0/48) | 0 von 8 |
| config | 0 % (0/10) | 0 von 2 |
| controller | 16,5 % (40/243) | 0 von 13 |
| controller/util | 100 % (20/20) | 1 von 1 |
| hooks | 0 % (0/325) | 0 von 19 |
| utils | 90,2 % (462/512) | 22 von 25 |

Je Ordner die Dateien mit Zeilen, die kein Test ausführt (die Zeilen führen in den Code):

<details><summary><b>(Wurzel)</b> – 0 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [App.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/App.tsx) | 0 % (0/5) | ganze Datei |

</details>

<details><summary><b>components</b> – 0 %, 15 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AccountMenu.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/AccountMenu.tsx) | 0 % (0/27) | ganze Datei |
| [Cookbook.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/Cookbook.tsx) | 0 % (0/35) | ganze Datei |
| [CookMode.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/CookMode.tsx) | 0 % (0/43) | ganze Datei |
| [DietBadge.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/DietBadge.tsx) | 0 % (0/2) | ganze Datei |
| [FeedbackDialog.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/FeedbackDialog.tsx) | 0 % (0/23) | ganze Datei |
| [Home.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/Home.tsx) | 0 % (0/24) | ganze Datei |
| [IngredientChecklist.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/IngredientChecklist.tsx) | 0 % (0/4) | ganze Datei |
| [LicensesPage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/LicensesPage.tsx) | 0 % (0/19) | ganze Datei |
| [Navbar.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/Navbar.tsx) | 0 % (0/8) | ganze Datei |
| [PrivacyPage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/PrivacyPage.tsx) | 0 % (0/1) | ganze Datei |
| [RecipeCard.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/RecipeCard.tsx) | 0 % (0/7) | ganze Datei |
| [RecipePage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/RecipePage.tsx) | 0 % (0/59) | ganze Datei |
| [RecipePrintSheet.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/RecipePrintSheet.tsx) | 0 % (0/25) | ganze Datei |
| [TravelDiary.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/TravelDiary.tsx) | 0 % (0/16) | ganze Datei |
| [TravelFolderPage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/TravelFolderPage.tsx) | 0 % (0/57) | ganze Datei |

</details>

<details><summary><b>components/account</b> – 0 %, 13 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AccountPage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/AccountPage.tsx) | 0 % (0/9) | ganze Datei |
| [BackupSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/BackupSection.tsx) | 0 % (0/49) | ganze Datei |
| [FavoritesSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/FavoritesSection.tsx) | 0 % (0/9) | ganze Datei |
| [FeedbackSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/FeedbackSection.tsx) | 0 % (0/29) | ganze Datei |
| [GamesSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/GamesSection.tsx) | 0 % (0/23) | ganze Datei |
| [PermissionGate.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/PermissionGate.tsx) | 0 % (0/6) | ganze Datei |
| [ProfileSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/ProfileSection.tsx) | 0 % (0/94) | ganze Datei |
| [RecipeAdminSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/RecipeAdminSection.tsx) | 0 % (0/36) | ganze Datei |
| [RecipeEditor.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/RecipeEditor.tsx) | 0 % (0/59) | ganze Datei |
| [RecipeImageDropzone.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/RecipeImageDropzone.tsx) | 0 % (0/33) | ganze Datei |
| [SectionCount.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/SectionCount.tsx) | 0 % (0/3) | ganze Datei |
| [StatsSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/StatsSection.tsx) | 0 % (0/25) | ganze Datei |
| [UsersRolesSection.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/account/UsersRolesSection.tsx) | 0 % (0/100) | ganze Datei |

</details>

<details><summary><b>components/auth</b> – 9,3 %, 6 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AuthContext.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/auth/AuthContext.tsx) | 0 % (0/126) | ganze Datei |
| [AuthDialog.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/auth/AuthDialog.tsx) | 0 % (0/87) | ganze Datei |
| [EmailConfirmPage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/auth/EmailConfirmPage.tsx) | 0 % (0/39) | ganze Datei |
| [PasswordResetPage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/auth/PasswordResetPage.tsx) | 0 % (0/29) | ganze Datei |
| [ProtectedRoute.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/auth/ProtectedRoute.tsx) | 0 % (0/6) | ganze Datei |
| [SessionExpiryNotice.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/auth/SessionExpiryNotice.tsx) | 0 % (0/14) | ganze Datei |

Ganz getestet: [sessionStore.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/auth/sessionStore.ts)

</details>

<details><summary><b>components/games</b> – 0 %, 14 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Confetti.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/Confetti.tsx) | 0 % (0/4) | ganze Datei |
| [CrosswordGame.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/CrosswordGame.tsx) | 0 % (0/3) | ganze Datei |
| [CrosswordStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/CrosswordStatsTable.tsx) | 0 % (0/8) | ganze Datei |
| [GamesPage.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/GamesPage.tsx) | 0 % (0/9) | ganze Datei |
| [GameStatsLine.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/GameStatsLine.tsx) | 0 % (0/3) | ganze Datei |
| [KanaGame.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/KanaGame.tsx) | 0 % (0/2) | ganze Datei |
| [KanaStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/KanaStatsTable.tsx) | 0 % (0/10) | ganze Datei |
| [KanjiGame.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/KanjiGame.tsx) | 0 % (0/3) | ganze Datei |
| [KanjiStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/KanjiStatsTable.tsx) | 0 % (0/11) | ganze Datei |
| [MistakesList.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/MistakesList.tsx) | 0 % (0/3) | ganze Datei |
| [paths.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/paths.ts) | 0 % (0/7) | ganze Datei |
| [readingItems.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/readingItems.ts) | 0 % (0/2) | ganze Datei |
| [RomajiQuestion.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/RomajiQuestion.tsx) | 0 % (0/11) | ganze Datei |
| [RoundResult.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/RoundResult.tsx) | 0 % (0/3) | ganze Datei |

</details>

<details><summary><b>components/games/crossword</b> – 5,4 %, 8 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ActiveClue.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/ActiveClue.tsx) | 0 % (0/1) | ganze Datei |
| [CrosswordBoard.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/CrosswordBoard.tsx) | 0 % (0/199) | ganze Datei |
| [CrosswordClues.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/CrosswordClues.tsx) | 0 % (0/6) | ganze Datei |
| [CrosswordGrid.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/CrosswordGrid.tsx) | 0 % (0/9) | ganze Datei |
| [CrosswordResult.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/CrosswordResult.tsx) | 0 % (0/3) | ganze Datei |
| [CrosswordSetup.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/CrosswordSetup.tsx) | 0 % (0/15) | ganze Datei |
| [KanaKeyboard.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/KanaKeyboard.tsx) | 0 % (0/18) | ganze Datei |
| [puzzles.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/puzzles.ts) | 0 % (0/13) | ganze Datei |

Ganz getestet: [board.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/crossword/board.ts)

</details>

<details><summary><b>components/games/kana</b> – 0 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [KanaFeedback.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kana/KanaFeedback.tsx) | 0 % (0/1) | ganze Datei |
| [KanaRound.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kana/KanaRound.tsx) | 0 % (0/14) | ganze Datei |
| [KanaSetup.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kana/KanaSetup.tsx) | 0 % (0/29) | ganze Datei |

</details>

<details><summary><b>components/games/kanji</b> – 14,1 %, 4 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ChooseQuestion.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kanji/ChooseQuestion.tsx) | 0 % (0/18) | ganze Datei |
| [KanjiFeedback.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kanji/KanjiFeedback.tsx) | 0 % (0/4) | ganze Datei |
| [KanjiRound.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kanji/KanjiRound.tsx) | 0 % (0/18) | ganze Datei |
| [KanjiSetup.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kanji/KanjiSetup.tsx) | 0 % (0/33) | ganze Datei |

Ganz getestet: [rounds.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/games/kanji/rounds.ts)

</details>

<details><summary><b>components/helper</b> – 80,8 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [RecipeHelper.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/helper/RecipeHelper.tsx) | 80,8 % (21/26) | [L38–L41](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/helper/RecipeHelper.tsx#L38-L41) · [L54–L55](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/helper/RecipeHelper.tsx#L54-L55) |

</details>

<details><summary><b>components/layout</b> – 0 %, 4 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ErrorBoundary.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/layout/ErrorBoundary.tsx) | 0 % (0/6) | ganze Datei |
| [Footer.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/layout/Footer.tsx) | 0 % (0/5) | ganze Datei |
| [Layout.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/layout/Layout.tsx) | 0 % (0/6) | ganze Datei |
| [PageHeader.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/layout/PageHeader.tsx) | 0 % (0/1) | ganze Datei |

</details>

<details><summary><b>components/travel</b> – 4,0 %, 13 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [leafletMap.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/leafletMap.ts) | 0 % (0/7) | ganze Datei |
| [TravelFolderCard.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelFolderCard.tsx) | 0 % (0/3) | ganze Datei |
| [TravelFolderDialog.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelFolderDialog.tsx) | 0 % (0/60) | ganze Datei |
| [TravelFolderLink.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelFolderLink.tsx) | 0 % (0/3) | ganze Datei |
| [TravelFolderText.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelFolderText.tsx) | 0 % (0/24) | ganze Datei |
| [TravelLightbox.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelLightbox.tsx) | 0 % (0/113) | ganze Datei |
| [TravelLocationMap.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelLocationMap.tsx) | 0 % (0/44) | ganze Datei |
| [TravelLocationPicker.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelLocationPicker.tsx) | 0 % (0/31) | ganze Datei |
| [TravelMap.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelMap.tsx) | 0 % (0/65) | ganze Datei |
| [TravelMonthField.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelMonthField.tsx) | 0 % (0/6) | ganze Datei |
| [TravelPhotoDropzone.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelPhotoDropzone.tsx) | 0 % (0/27) | ganze Datei |
| [TravelPhotoSorter.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelPhotoSorter.tsx) | 0 % (0/91) | ganze Datei |
| [TravelStopsEditor.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/TravelStopsEditor.tsx) | 0 % (0/24) | ganze Datei |

Ganz getestet: [modifierWheelZoom.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/travel/modifierWheelZoom.ts)

</details>

<details><summary><b>components/ui</b> – 0 %, 8 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Avatar.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/Avatar.tsx) | 0 % (0/3) | ganze Datei |
| [BackToTop.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/BackToTop.tsx) | 0 % (0/8) | ganze Datei |
| [ConfirmDeleteDialog.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/ConfirmDeleteDialog.tsx) | 0 % (0/13) | ganze Datei |
| [Dialog.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/Dialog.tsx) | 0 % (0/15) | ganze Datei |
| [FormError.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/FormError.tsx) | 0 % (0/2) | ganze Datei |
| [LoadError.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/LoadError.tsx) | 0 % (0/1) | ganze Datei |
| [SpeakButton.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/SpeakButton.tsx) | 0 % (0/5) | ganze Datei |
| [Spinner.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/components/ui/Spinner.tsx) | 0 % (0/1) | ganze Datei |

</details>

<details><summary><b>config</b> – 0 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [labels.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/config/labels.ts) | 0 % (0/3) | ganze Datei |
| [navigation.tsx](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/config/navigation.tsx) | 0 % (0/7) | ganze Datei |

</details>

<details><summary><b>controller</b> – 16,5 %, 13 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [APIClient.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/APIClient.ts) | 49,3 % (34/69) | [L5](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/APIClient.ts#L5) · [L20–L121](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/APIClient.ts#L20-L121) · [L173](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/APIClient.ts#L173) |
| [BackupController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/BackupController.ts) | 0 % (0/14) | ganze Datei |
| [FavoritesController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/FavoritesController.ts) | 0 % (0/9) | ganze Datei |
| [FeedbackController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/FeedbackController.ts) | 0 % (0/14) | ganze Datei |
| [GamesController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/GamesController.ts) | 0 % (0/30) | ganze Datei |
| [ImageController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/ImageController.ts) | 50,0 % (3/6) | [L8–L10](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/ImageController.ts#L8-L10) |
| [LicenseController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/LicenseController.ts) | 0 % (0/3) | ganze Datei |
| [PlaceSearchController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/PlaceSearchController.ts) | 0 % (0/6) | ganze Datei |
| [RecipeController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/RecipeController.ts) | 27,3 % (3/11) | [L13–L26](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/RecipeController.ts#L13-L26) |
| [RoleController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/RoleController.ts) | 0 % (0/11) | ganze Datei |
| [StatsController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/StatsController.ts) | 0 % (0/5) | ganze Datei |
| [TravelController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/TravelController.ts) | 0 % (0/29) | ganze Datei |
| [UserController.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/UserController.ts) | 0 % (0/36) | ganze Datei |

</details>

<details><summary><b>controller/util</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ErrorHandler.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/controller/util/ErrorHandler.ts)

</details>

<details><summary><b>hooks</b> – 0 %, 19 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [createListStore.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/createListStore.ts) | 0 % (0/24) | ganze Datei |
| [useApi.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useApi.ts) | 0 % (0/15) | ganze Datei |
| [useBodyScrollLock.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useBodyScrollLock.ts) | 0 % (0/6) | ganze Datei |
| [useFavorites.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useFavorites.ts) | 0 % (0/33) | ganze Datei |
| [useFileDrop.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useFileDrop.ts) | 0 % (0/24) | ganze Datei |
| [useGameMistakes.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useGameMistakes.ts) | 0 % (0/25) | ganze Datei |
| [useGameStats.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useGameStats.ts) | 0 % (0/29) | ganze Datei |
| [useHistoryOverlay.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useHistoryOverlay.ts) | 0 % (0/7) | ganze Datei |
| [useJapaneseWords.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useJapaneseWords.ts) | 0 % (0/28) | ganze Datei |
| [useOnline.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useOnline.ts) | 0 % (0/6) | ganze Datei |
| [useOpenFeedbackCount.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useOpenFeedbackCount.ts) | 0 % (0/20) | ganze Datei |
| [usePageTitle.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/usePageTitle.ts) | 0 % (0/4) | ganze Datei |
| [useRecipes.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useRecipes.ts) | 0 % (0/6) | ganze Datei |
| [useScrollMemory.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useScrollMemory.ts) | 0 % (0/12) | ganze Datei |
| [useTheme.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useTheme.ts) | 0 % (0/18) | ganze Datei |
| [useTravelFolders.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useTravelFolders.ts) | 0 % (0/9) | ganze Datei |
| [useUnsavedChanges.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useUnsavedChanges.ts) | 0 % (0/11) | ganze Datei |
| [useVisitCounter.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useVisitCounter.ts) | 0 % (0/20) | ganze Datei |
| [useWakeLock.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/hooks/useWakeLock.ts) | 0 % (0/28) | ganze Datei |

</details>

<details><summary><b>utils</b> – 90,2 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [offlineCache.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/offlineCache.ts) | 0 % (0/5) | ganze Datei |
| [resizeImage.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/resizeImage.ts) | 0 % (0/31) | ganze Datei |
| [speech.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/speech.ts) | 0 % (0/14) | ganze Datei |

Ganz getestet: [appUpdate.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/appUpdate.ts) · [backup.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/backup.ts) · [bring.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/bring.ts) · [chance.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/chance.ts) · [crossword.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/crossword.ts) · [feedback.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/feedback.ts) · [gameStats.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/gameStats.ts) · [historyOverlay.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/historyOverlay.ts) · [kana.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/kana.ts) · [kanaQuiz.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/kanaQuiz.ts) · [kanjiChoices.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/kanjiChoices.ts) · [kanjiReading.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/kanjiReading.ts) · [password.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/password.ts) · [recentPicks.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/recentPicks.ts) · [recipe.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/recipe.ts) · [recipeFilter.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/recipeFilter.ts) · [retry.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/retry.ts) · [scrollMemory.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/scrollMemory.ts) · [stats.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/stats.ts) · [storedFirst.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/storedFirst.ts) · [travel.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/travel.ts) · [visits.ts](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/src/utils/visits.ts)

</details>

## Backend: 98,1 % der Zeilen getestet

2496 von 2545 Zeilen mit Code in 165 Dateien unter `backend/src/main/java/`; 143 Dateien sind ganz getestet.

| Ordner | Getestet | Dateien ganz getestet |
|---|---:|---:|
| de/jan/backup | 100 % (234/234) | 2 von 2 |
| de/jan/config | 98,5 % (258/262) | 13 von 15 |
| de/jan/controller | 100 % (163/163) | 12 von 12 |
| de/jan/controller/requests | 100 % (29/29) | 22 von 22 |
| de/jan/controller/response | 100 % (7/7) | 5 von 5 |
| de/jan/exceptions | 76,0 % (19/25) | 4 von 6 |
| de/jan/feedback | 96,2 % (25/26) | 2 von 3 |
| de/jan/feedback/repository | 100 % (33/33) | 1 von 1 |
| de/jan/games | 97,4 % (111/114) | 11 von 14 |
| de/jan/games/repository | 100 % (201/201) | 5 von 5 |
| de/jan/image | 95,3 % (101/106) | 3 von 6 |
| de/jan/license | 92,9 % (26/28) | 0 von 1 |
| de/jan/mail | 100 % (153/153) | 12 von 12 |
| de/jan/objectify | 89,7 % (61/68) | 0 von 2 |
| de/jan/recipe | 89,4 % (42/47) | 4 von 6 |
| de/jan/recipe/favorites | 100 % (19/19) | 1 von 1 |
| de/jan/recipe/repository | 100 % (129/129) | 2 von 2 |
| de/jan/role | 100 % (27/27) | 4 von 4 |
| de/jan/role/repository | 100 % (73/73) | 1 von 1 |
| de/jan/security | 99,2 % (120/121) | 4 von 5 |
| de/jan/stats | 92,3 % (12/13) | 1 von 2 |
| de/jan/stats/repository | 100 % (36/36) | 1 von 1 |
| de/jan/travel | 94,8 % (92/97) | 12 von 14 |
| de/jan/travel/repository | 100 % (241/241) | 5 von 5 |
| de/jan/user | 89,4 % (76/85) | 8 von 10 |
| de/jan/user/repository | 100 % (178/178) | 5 von 5 |
| de/jan/util | 100 % (30/30) | 3 von 3 |

Je Ordner die Dateien mit Zeilen, die kein Test ausführt (die Zeilen führen in den Code):

<details><summary><b>de/jan/backup</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [BackupRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/backup/BackupRepository.java) · [RestoreRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/backup/RestoreRepository.java)

</details>

<details><summary><b>de/jan/config</b> – 98,5 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AdminBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/AdminBootstrapConfig.java) | 96,6 % (28/29) | [L39](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/AdminBootstrapConfig.java#L39) |
| [UnconfirmedAccountsConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/UnconfirmedAccountsConfig.java) | 76,9 % (10/13) | [L31–L34](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/UnconfirmedAccountsConfig.java#L31-L34) |

Ganz getestet: [CloudRun.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/CloudRun.java) · [CorsConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/CorsConfig.java) · [ImageStorageConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/ImageStorageConfig.java) · [ObjectifyConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/ObjectifyConfig.java) · [ObjectifyFilterConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/ObjectifyFilterConfig.java) · [OpenApiConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/OpenApiConfig.java) · [RateLimitFilterConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/RateLimitFilterConfig.java) · [RecipeBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/RecipeBootstrapConfig.java) · [RoleBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/RoleBootstrapConfig.java) · [SecurityConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/SecurityConfig.java) · [SeedImport.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/SeedImport.java) · [TravelBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/TravelBootstrapConfig.java) · [WebConfig.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/config/WebConfig.java)

</details>

<details><summary><b>de/jan/controller</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [BackupController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/BackupController.java) · [FavoritesController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/FavoritesController.java) · [FeedbackController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/FeedbackController.java) · [GamesController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/GamesController.java) · [ImageController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/ImageController.java) · [ImageResponse.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/ImageResponse.java) · [LicenseController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/LicenseController.java) · [RecipeController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/RecipeController.java) · [RoleController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/RoleController.java) · [StatsController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/StatsController.java) · [TravelController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/TravelController.java) · [UserController.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/UserController.java)

</details>

<details><summary><b>de/jan/controller/requests</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ChangePasswordRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/ChangePasswordRequest.java) · [ConfirmEmailRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/ConfirmEmailRequest.java) · [CrosswordResultRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/CrosswordResultRequest.java) · [DeleteAccountRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/DeleteAccountRequest.java) · [FavoriteRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/FavoriteRequest.java) · [FeedbackRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/FeedbackRequest.java) · [KanaResultRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/KanaResultRequest.java) · [KanjiResultRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/KanjiResultRequest.java) · [LoginRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/LoginRequest.java) · [PasswordResetRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/PasswordResetRequest.java) · [RecipeRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/RecipeRequest.java) · [RegisterRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/RegisterRequest.java) · [ResetPasswordRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/ResetPasswordRequest.java) · [RoleRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/RoleRequest.java) · [SetRolesRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/SetRolesRequest.java) · [TravelFolderRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/TravelFolderRequest.java) · [TravelFolderTextRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/TravelFolderTextRequest.java) · [TravelPhotoCaptionRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/TravelPhotoCaptionRequest.java) · [TravelPhotoOrderRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/TravelPhotoOrderRequest.java) · [TravelStopRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/TravelStopRequest.java) · [UpdateProfileRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/UpdateProfileRequest.java) · [VisitRequest.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/requests/VisitRequest.java)

</details>

<details><summary><b>de/jan/controller/response</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ImageUploadResponse.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/response/ImageUploadResponse.java) · [LicenseResponse.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/response/LicenseResponse.java) · [LoginResponse.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/response/LoginResponse.java) · [RestoreResponse.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/response/RestoreResponse.java) · [StatsResponse.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/controller/response/StatsResponse.java)

</details>

<details><summary><b>de/jan/exceptions</b> – 76,0 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ErrorMailFilter.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/ErrorMailFilter.java) | 54,5 % (6/11) | [L29–L33](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/ErrorMailFilter.java#L29-L33) |
| [GlobalExceptionHandler.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/GlobalExceptionHandler.java) | 83,3 % (5/6) | [L24](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/GlobalExceptionHandler.java#L24) |

Ganz getestet: [EntityNotFoundException.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/EntityNotFoundException.java) · [EntityStateException.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/EntityStateException.java) · [UnauthenticatedException.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/UnauthenticatedException.java) · [UnauthorizedException.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/exceptions/UnauthorizedException.java)

</details>

<details><summary><b>de/jan/feedback</b> – 96,2 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Feedback.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/feedback/Feedback.java) | 94,7 % (18/19) | [L53](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/feedback/Feedback.java#L53) |

Ganz getestet: [FeedbackDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/feedback/FeedbackDAO.java) · [FeedbackDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/feedback/FeedbackDTO.java)

</details>

<details><summary><b>de/jan/feedback/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [FeedbackRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/feedback/repository/FeedbackRepository.java)

</details>

<details><summary><b>de/jan/games</b> – 97,4 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [CrosswordStats.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/CrosswordStats.java) | 93,8 % (15/16) | [L36](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/CrosswordStats.java#L36) |
| [KanaStats.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanaStats.java) | 95,7 % (22/23) | [L47](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanaStats.java#L47) |
| [KanjiStats.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanjiStats.java) | 96,0 % (24/25) | [L47](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanjiStats.java#L47) |

Ganz getestet: [CrosswordStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/CrosswordStatsDAO.java) · [CrosswordStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/CrosswordStatsDTO.java) · [KanaMistake.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanaMistake.java) · [KanaMistakeDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanaMistakeDTO.java) · [KanaStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanaStatsDAO.java) · [KanaStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanaStatsDTO.java) · [KanjiMistake.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanjiMistake.java) · [KanjiMistakeDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanjiMistakeDTO.java) · [KanjiStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanjiStatsDAO.java) · [KanjiStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/KanjiStatsDTO.java) · [Mistake.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/Mistake.java)

</details>

<details><summary><b>de/jan/games/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [CrosswordStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/repository/CrosswordStatsRepository.java) · [KanaStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/repository/KanaStatsRepository.java) · [KanjiStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/repository/KanjiStatsRepository.java) · [MistakeList.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/repository/MistakeList.java) · [MistakeStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/games/repository/MistakeStatsRepository.java)

</details>

<details><summary><b>de/jan/image</b> – 95,3 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ImageScaler.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/ImageScaler.java) | 94,1 % (32/34) | [L77–L78](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/ImageScaler.java#L77-L78) |
| [ImageType.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/ImageType.java) | 95,5 % (21/22) | [L42](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/ImageType.java#L42) |
| [RecipeImageRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/RecipeImageRepository.java) | 93,5 % (29/31) | [L73–L74](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/RecipeImageRepository.java#L73-L74) |

Ganz getestet: [RecipeImage.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/RecipeImage.java) · [RecipeImageDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/RecipeImageDAO.java) · [StoredImage.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/image/StoredImage.java)

</details>

<details><summary><b>de/jan/license</b> – 92,9 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [LicenseRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/license/LicenseRepository.java) | 92,9 % (26/28) | [L43–L44](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/license/LicenseRepository.java#L43-L44) |

</details>

<details><summary><b>de/jan/mail</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [AbstractMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/AbstractMailService.java) · [AdminMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/AdminMailService.java) · [BrevoMailSender.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/BrevoMailSender.java) · [ConfirmationMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/ConfirmationMailService.java) · [ErrorMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/ErrorMailService.java) · [FeedbackMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/FeedbackMailService.java) · [LinkMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/LinkMailService.java) · [MailTemplate.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/MailTemplate.java) · [MailTemplates.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/MailTemplates.java) · [PasswordResetMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/PasswordResetMailService.java) · [RegistrationMailService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/RegistrationMailService.java) · [Sender.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/mail/Sender.java)

</details>

<details><summary><b>de/jan/objectify</b> – 89,7 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [BaseDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/objectify/BaseDAO.java) | 95,7 % (45/47) | [L37](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/objectify/BaseDAO.java#L37) · [L69](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/objectify/BaseDAO.java#L69) |
| [Filter.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/objectify/Filter.java) | 76,2 % (16/21) | [L36](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/objectify/Filter.java#L36) · [L44–L56](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/objectify/Filter.java#L44-L56) |

</details>

<details><summary><b>de/jan/recipe</b> – 89,4 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Recipe.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/Recipe.java) | 96,4 % (27/28) | [L41](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/Recipe.java#L41) |
| [RecipeSeedMarker.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java) | 50,0 % (4/8) | [L24–L26](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java#L24-L26) · [L33–L34](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java#L33-L34) |

Ganz getestet: [RecipeDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/RecipeDAO.java) · [RecipeDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/RecipeDTO.java) · [RecipeSeedMarkerDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/RecipeSeedMarkerDAO.java) · [RecipeTag.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/RecipeTag.java)

</details>

<details><summary><b>de/jan/recipe/favorites</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [FavoritesRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/favorites/FavoritesRepository.java)

</details>

<details><summary><b>de/jan/recipe/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [RecipeRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/repository/RecipeRepository.java) · [RecipeSeedMarkerRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/recipe/repository/RecipeSeedMarkerRepository.java)

</details>

<details><summary><b>de/jan/role</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [Permission.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/role/Permission.java) · [Role.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/role/Role.java) · [RoleDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/role/RoleDAO.java) · [RoleDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/role/RoleDTO.java)

</details>

<details><summary><b>de/jan/role/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [RoleRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/role/repository/RoleRepository.java)

</details>

<details><summary><b>de/jan/security</b> – 99,2 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Authorization.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/security/Authorization.java) | 93,8 % (15/16) | [L26](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/security/Authorization.java#L26) |

Ganz getestet: [CurrentUserArgumentResolver.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/security/CurrentUserArgumentResolver.java) · [JwtService.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/security/JwtService.java) · [LoginRateLimitFilter.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/security/LoginRateLimitFilter.java) · [RateLimiter.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/security/RateLimiter.java)

</details>

<details><summary><b>de/jan/stats</b> – 92,3 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [VisitDay.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/stats/VisitDay.java) | 90,9 % (10/11) | [L37](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/stats/VisitDay.java#L37) |

Ganz getestet: [VisitDayDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/stats/VisitDayDAO.java)

</details>

<details><summary><b>de/jan/stats/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [VisitDayRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/stats/repository/VisitDayRepository.java)

</details>

<details><summary><b>de/jan/travel</b> – 94,8 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [TravelFolder.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelFolder.java) | 97,0 % (32/33) | [L104](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelFolder.java#L104) |
| [TravelSeedMarker.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelSeedMarker.java) | 50,0 % (4/8) | [L24–L26](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelSeedMarker.java#L24-L26) · [L33–L34](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelSeedMarker.java#L33-L34) |

Ganz getestet: [TravelFolderDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelFolderDAO.java) · [TravelFolderDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelFolderDTO.java) · [TravelPhoto.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelPhoto.java) · [TravelPhotoDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelPhotoDAO.java) · [TravelPhotoDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelPhotoDTO.java) · [TravelPhotoFile.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelPhotoFile.java) · [TravelPhotoFileDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelPhotoFileDAO.java) · [TravelPhotoPreview.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelPhotoPreview.java) · [TravelPhotoPreviewDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelPhotoPreviewDAO.java) · [TravelSeedMarkerDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelSeedMarkerDAO.java) · [TravelStop.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelStop.java) · [TravelStopDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/TravelStopDTO.java)

</details>

<details><summary><b>de/jan/travel/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [TravelFolderRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/repository/TravelFolderRepository.java) · [TravelPhotoFileRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/repository/TravelPhotoFileRepository.java) · [TravelPhotoPreviewRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/repository/TravelPhotoPreviewRepository.java) · [TravelPhotoRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/repository/TravelPhotoRepository.java) · [TravelSeedMarkerRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/travel/repository/TravelSeedMarkerRepository.java)

</details>

<details><summary><b>de/jan/user</b> – 89,4 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [MailLinkToken.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/MailLinkToken.java) | 83,3 % (10/12) | [L40](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/MailLinkToken.java#L40) · [L52](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/MailLinkToken.java#L52) |
| [User.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/User.java) | 83,3 % (35/42) | [L78–L79](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/User.java#L78-L79) · [L108](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/User.java#L108) · [L120](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/User.java#L120) · [L126–L127](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/User.java#L126-L127) · [L142](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/User.java#L142) |

Ganz getestet: [EmailConfirmationToken.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/EmailConfirmationToken.java) · [EmailConfirmationTokenDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/EmailConfirmationTokenDAO.java) · [MailLinkTokenDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/MailLinkTokenDAO.java) · [PasswordResetToken.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/PasswordResetToken.java) · [PasswordResetTokenDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/PasswordResetTokenDAO.java) · [UserAdminDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/UserAdminDTO.java) · [UserDAO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/UserDAO.java) · [UserDTO.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/UserDTO.java)

</details>

<details><summary><b>de/jan/user/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [EmailConfirmationRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/repository/EmailConfirmationRepository.java) · [MailLinks.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/repository/MailLinks.java) · [OneTimeToken.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/repository/OneTimeToken.java) · [PasswordResetRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/repository/PasswordResetRepository.java) · [UserRepository.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/user/repository/UserRepository.java)

</details>

<details><summary><b>de/jan/util</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ListCache.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/util/ListCache.java) · [TextCleaner.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/util/TextCleaner.java) · [TextRules.java](https://github.com/JanR99/jan-website-react/blob/7ec8fb43d5268451800d5ea047474fc2a8ca650b/backend/src/main/java/de/jan/util/TextRules.java)

</details>
