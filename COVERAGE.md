# Test coverage

Stand: [9aa6251](https://github.com/JanR99/jan-website-react/commit/9aa625189838e4f3d218c61965eef89be4db9f40) vom 09.11.2026. Wird nach jedem Push auf `master` neu geschrieben (`.github/workflows/coverage-badges.yml`).

![Frontend coverage](frontend-coverage.svg) ![Backend coverage](backend-coverage.svg)

## Frontend: 19,0 % der Zeilen getestet

674 von 3541 Zeilen mit Code in 165 Dateien unter `src/`; 28 Dateien sind ganz getestet.

| Ordner | Getestet | Dateien ganz getestet |
|---|---:|---:|
| (Wurzel) | 0 % (0/5) | 0 von 1 |
| components | 0 % (0/359) | 0 von 16 |
| components/account | 0 % (0/480) | 0 von 14 |
| components/auth | 9,3 % (31/332) | 1 von 7 |
| components/games | 0 % (0/97) | 0 von 16 |
| components/games/crossword | 5,4 % (15/279) | 1 von 9 |
| components/games/kana | 0 % (0/44) | 0 von 3 |
| components/games/kanji | 14,1 % (12/85) | 1 von 5 |
| components/games/vocab | 0 % (0/65) | 0 von 5 |
| components/helper | 80,8 % (21/26) | 0 von 1 |
| components/layout | 0 % (0/18) | 0 von 4 |
| components/travel | 4,0 % (21/519) | 1 von 14 |
| components/ui | 0 % (0/48) | 0 von 8 |
| config | 0 % (0/10) | 0 von 2 |
| controller | 15,5 % (40/258) | 0 von 13 |
| controller/util | 100 % (20/20) | 1 von 1 |
| hooks | 0 % (0/331) | 0 von 19 |
| utils | 91,0 % (514/565) | 23 von 27 |

Je Ordner die Dateien mit Zeilen, die kein Test ausführt (die Zeilen führen in den Code):

<details><summary><b>(Wurzel)</b> – 0 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [App.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/App.tsx) | 0 % (0/5) | ganze Datei |

</details>

<details><summary><b>components</b> – 0 %, 16 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AccountMenu.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/AccountMenu.tsx) | 0 % (0/27) | ganze Datei |
| [Cookbook.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/Cookbook.tsx) | 0 % (0/35) | ganze Datei |
| [CookMode.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/CookMode.tsx) | 0 % (0/43) | ganze Datei |
| [DietBadge.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/DietBadge.tsx) | 0 % (0/2) | ganze Datei |
| [FeedbackDialog.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/FeedbackDialog.tsx) | 0 % (0/23) | ganze Datei |
| [Home.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/Home.tsx) | 0 % (0/24) | ganze Datei |
| [IngredientChecklist.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/IngredientChecklist.tsx) | 0 % (0/4) | ganze Datei |
| [LicensesPage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/LicensesPage.tsx) | 0 % (0/19) | ganze Datei |
| [Navbar.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/Navbar.tsx) | 0 % (0/8) | ganze Datei |
| [PrivacyPage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/PrivacyPage.tsx) | 0 % (0/1) | ganze Datei |
| [RecipeCard.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/RecipeCard.tsx) | 0 % (0/7) | ganze Datei |
| [RecipePage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/RecipePage.tsx) | 0 % (0/59) | ganze Datei |
| [RecipePrintSheet.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/RecipePrintSheet.tsx) | 0 % (0/25) | ganze Datei |
| [ShareButton.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ShareButton.tsx) | 0 % (0/9) | ganze Datei |
| [TravelDiary.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/TravelDiary.tsx) | 0 % (0/16) | ganze Datei |
| [TravelFolderPage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/TravelFolderPage.tsx) | 0 % (0/57) | ganze Datei |

</details>

<details><summary><b>components/account</b> – 0 %, 14 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AccountPage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/AccountPage.tsx) | 0 % (0/9) | ganze Datei |
| [BackupSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/BackupSection.tsx) | 0 % (0/49) | ganze Datei |
| [FavoritesSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/FavoritesSection.tsx) | 0 % (0/9) | ganze Datei |
| [FeedbackSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/FeedbackSection.tsx) | 0 % (0/29) | ganze Datei |
| [GamesSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/GamesSection.tsx) | 0 % (0/29) | ganze Datei |
| [PermissionGate.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/PermissionGate.tsx) | 0 % (0/6) | ganze Datei |
| [ProfileSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/ProfileSection.tsx) | 0 % (0/94) | ganze Datei |
| [RecipeAdminSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/RecipeAdminSection.tsx) | 0 % (0/36) | ganze Datei |
| [RecipeEditor.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/RecipeEditor.tsx) | 0 % (0/59) | ganze Datei |
| [RecipeImageDropzone.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/RecipeImageDropzone.tsx) | 0 % (0/33) | ganze Datei |
| [SectionCount.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/SectionCount.tsx) | 0 % (0/3) | ganze Datei |
| [StatsSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/StatsSection.tsx) | 0 % (0/22) | ganze Datei |
| [UsersRolesSection.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/UsersRolesSection.tsx) | 0 % (0/100) | ganze Datei |
| [VisitsChart.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/account/VisitsChart.tsx) | 0 % (0/2) | ganze Datei |

</details>

<details><summary><b>components/auth</b> – 9,3 %, 6 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AuthContext.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/auth/AuthContext.tsx) | 0 % (0/126) | ganze Datei |
| [AuthDialog.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/auth/AuthDialog.tsx) | 0 % (0/87) | ganze Datei |
| [EmailConfirmPage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/auth/EmailConfirmPage.tsx) | 0 % (0/39) | ganze Datei |
| [PasswordResetPage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/auth/PasswordResetPage.tsx) | 0 % (0/29) | ganze Datei |
| [ProtectedRoute.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/auth/ProtectedRoute.tsx) | 0 % (0/6) | ganze Datei |
| [SessionExpiryNotice.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/auth/SessionExpiryNotice.tsx) | 0 % (0/14) | ganze Datei |

Ganz getestet: [sessionStore.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/auth/sessionStore.ts)

</details>

<details><summary><b>components/games</b> – 0 %, 16 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Confetti.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/Confetti.tsx) | 0 % (0/4) | ganze Datei |
| [CrosswordGame.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/CrosswordGame.tsx) | 0 % (0/3) | ganze Datei |
| [CrosswordStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/CrosswordStatsTable.tsx) | 0 % (0/8) | ganze Datei |
| [GamesPage.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/GamesPage.tsx) | 0 % (0/11) | ganze Datei |
| [GameStatsLine.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/GameStatsLine.tsx) | 0 % (0/3) | ganze Datei |
| [KanaGame.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/KanaGame.tsx) | 0 % (0/2) | ganze Datei |
| [KanaStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/KanaStatsTable.tsx) | 0 % (0/10) | ganze Datei |
| [KanjiGame.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/KanjiGame.tsx) | 0 % (0/3) | ganze Datei |
| [KanjiStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/KanjiStatsTable.tsx) | 0 % (0/11) | ganze Datei |
| [MistakesList.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/MistakesList.tsx) | 0 % (0/3) | ganze Datei |
| [paths.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/paths.ts) | 0 % (0/9) | ganze Datei |
| [readingItems.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/readingItems.ts) | 0 % (0/3) | ganze Datei |
| [RomajiQuestion.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/RomajiQuestion.tsx) | 0 % (0/11) | ganze Datei |
| [RoundResult.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/RoundResult.tsx) | 0 % (0/3) | ganze Datei |
| [VocabGame.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/VocabGame.tsx) | 0 % (0/9) | ganze Datei |
| [VocabStatsTable.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/VocabStatsTable.tsx) | 0 % (0/4) | ganze Datei |

</details>

<details><summary><b>components/games/crossword</b> – 5,4 %, 8 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ActiveClue.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/ActiveClue.tsx) | 0 % (0/1) | ganze Datei |
| [CrosswordBoard.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/CrosswordBoard.tsx) | 0 % (0/199) | ganze Datei |
| [CrosswordClues.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/CrosswordClues.tsx) | 0 % (0/6) | ganze Datei |
| [CrosswordGrid.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/CrosswordGrid.tsx) | 0 % (0/9) | ganze Datei |
| [CrosswordResult.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/CrosswordResult.tsx) | 0 % (0/3) | ganze Datei |
| [CrosswordSetup.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/CrosswordSetup.tsx) | 0 % (0/15) | ganze Datei |
| [KanaKeyboard.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/KanaKeyboard.tsx) | 0 % (0/18) | ganze Datei |
| [puzzles.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/puzzles.ts) | 0 % (0/13) | ganze Datei |

Ganz getestet: [board.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/crossword/board.ts)

</details>

<details><summary><b>components/games/kana</b> – 0 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [KanaFeedback.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kana/KanaFeedback.tsx) | 0 % (0/1) | ganze Datei |
| [KanaRound.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kana/KanaRound.tsx) | 0 % (0/14) | ganze Datei |
| [KanaSetup.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kana/KanaSetup.tsx) | 0 % (0/29) | ganze Datei |

</details>

<details><summary><b>components/games/kanji</b> – 14,1 %, 4 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ChooseQuestion.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kanji/ChooseQuestion.tsx) | 0 % (0/18) | ganze Datei |
| [KanjiFeedback.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kanji/KanjiFeedback.tsx) | 0 % (0/4) | ganze Datei |
| [KanjiRound.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kanji/KanjiRound.tsx) | 0 % (0/18) | ganze Datei |
| [KanjiSetup.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kanji/KanjiSetup.tsx) | 0 % (0/33) | ganze Datei |

Ganz getestet: [rounds.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/kanji/rounds.ts)

</details>

<details><summary><b>components/games/vocab</b> – 0 %, 5 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [rounds.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/vocab/rounds.ts) | 0 % (0/4) | ganze Datei |
| [VocabFeedback.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/vocab/VocabFeedback.tsx) | 0 % (0/1) | ganze Datei |
| [VocabQuestion.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/vocab/VocabQuestion.tsx) | 0 % (0/13) | ganze Datei |
| [VocabRound.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/vocab/VocabRound.tsx) | 0 % (0/16) | ganze Datei |
| [VocabSetup.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/games/vocab/VocabSetup.tsx) | 0 % (0/31) | ganze Datei |

</details>

<details><summary><b>components/helper</b> – 80,8 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [RecipeHelper.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/helper/RecipeHelper.tsx) | 80,8 % (21/26) | [L38–L41](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/helper/RecipeHelper.tsx#L38-L41) · [L54–L55](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/helper/RecipeHelper.tsx#L54-L55) |

</details>

<details><summary><b>components/layout</b> – 0 %, 4 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ErrorBoundary.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/layout/ErrorBoundary.tsx) | 0 % (0/6) | ganze Datei |
| [Footer.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/layout/Footer.tsx) | 0 % (0/5) | ganze Datei |
| [Layout.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/layout/Layout.tsx) | 0 % (0/6) | ganze Datei |
| [PageHeader.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/layout/PageHeader.tsx) | 0 % (0/1) | ganze Datei |

</details>

<details><summary><b>components/travel</b> – 4,0 %, 13 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [leafletMap.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/leafletMap.ts) | 0 % (0/7) | ganze Datei |
| [TravelFolderCard.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelFolderCard.tsx) | 0 % (0/3) | ganze Datei |
| [TravelFolderDialog.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelFolderDialog.tsx) | 0 % (0/60) | ganze Datei |
| [TravelFolderLink.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelFolderLink.tsx) | 0 % (0/3) | ganze Datei |
| [TravelFolderText.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelFolderText.tsx) | 0 % (0/24) | ganze Datei |
| [TravelLightbox.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelLightbox.tsx) | 0 % (0/113) | ganze Datei |
| [TravelLocationMap.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelLocationMap.tsx) | 0 % (0/44) | ganze Datei |
| [TravelLocationPicker.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelLocationPicker.tsx) | 0 % (0/31) | ganze Datei |
| [TravelMap.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelMap.tsx) | 0 % (0/65) | ganze Datei |
| [TravelMonthField.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelMonthField.tsx) | 0 % (0/6) | ganze Datei |
| [TravelPhotoDropzone.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelPhotoDropzone.tsx) | 0 % (0/27) | ganze Datei |
| [TravelPhotoSorter.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelPhotoSorter.tsx) | 0 % (0/91) | ganze Datei |
| [TravelStopsEditor.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/TravelStopsEditor.tsx) | 0 % (0/24) | ganze Datei |

Ganz getestet: [modifierWheelZoom.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/travel/modifierWheelZoom.ts)

</details>

<details><summary><b>components/ui</b> – 0 %, 8 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Avatar.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/Avatar.tsx) | 0 % (0/3) | ganze Datei |
| [BackToTop.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/BackToTop.tsx) | 0 % (0/8) | ganze Datei |
| [ConfirmDeleteDialog.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/ConfirmDeleteDialog.tsx) | 0 % (0/13) | ganze Datei |
| [Dialog.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/Dialog.tsx) | 0 % (0/15) | ganze Datei |
| [FormError.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/FormError.tsx) | 0 % (0/2) | ganze Datei |
| [LoadError.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/LoadError.tsx) | 0 % (0/1) | ganze Datei |
| [SpeakButton.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/SpeakButton.tsx) | 0 % (0/5) | ganze Datei |
| [Spinner.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/components/ui/Spinner.tsx) | 0 % (0/1) | ganze Datei |

</details>

<details><summary><b>config</b> – 0 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [labels.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/config/labels.ts) | 0 % (0/3) | ganze Datei |
| [navigation.tsx](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/config/navigation.tsx) | 0 % (0/7) | ganze Datei |

</details>

<details><summary><b>controller</b> – 15,5 %, 13 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [APIClient.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/APIClient.ts) | 49,3 % (34/69) | [L5](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/APIClient.ts#L5) · [L20–L121](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/APIClient.ts#L20-L121) · [L173](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/APIClient.ts#L173) |
| [BackupController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/BackupController.ts) | 0 % (0/14) | ganze Datei |
| [FavoritesController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/FavoritesController.ts) | 0 % (0/9) | ganze Datei |
| [FeedbackController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/FeedbackController.ts) | 0 % (0/14) | ganze Datei |
| [GamesController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/GamesController.ts) | 0 % (0/45) | ganze Datei |
| [ImageController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/ImageController.ts) | 50,0 % (3/6) | [L8–L10](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/ImageController.ts#L8-L10) |
| [LicenseController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/LicenseController.ts) | 0 % (0/3) | ganze Datei |
| [PlaceSearchController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/PlaceSearchController.ts) | 0 % (0/6) | ganze Datei |
| [RecipeController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/RecipeController.ts) | 27,3 % (3/11) | [L13–L26](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/RecipeController.ts#L13-L26) |
| [RoleController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/RoleController.ts) | 0 % (0/11) | ganze Datei |
| [StatsController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/StatsController.ts) | 0 % (0/5) | ganze Datei |
| [TravelController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/TravelController.ts) | 0 % (0/29) | ganze Datei |
| [UserController.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/UserController.ts) | 0 % (0/36) | ganze Datei |

</details>

<details><summary><b>controller/util</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ErrorHandler.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/controller/util/ErrorHandler.ts)

</details>

<details><summary><b>hooks</b> – 0 %, 19 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [createListStore.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/createListStore.ts) | 0 % (0/24) | ganze Datei |
| [useApi.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useApi.ts) | 0 % (0/15) | ganze Datei |
| [useBodyScrollLock.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useBodyScrollLock.ts) | 0 % (0/6) | ganze Datei |
| [useFavorites.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useFavorites.ts) | 0 % (0/33) | ganze Datei |
| [useFileDrop.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useFileDrop.ts) | 0 % (0/24) | ganze Datei |
| [useGameMistakes.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useGameMistakes.ts) | 0 % (0/27) | ganze Datei |
| [useGameStats.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useGameStats.ts) | 0 % (0/31) | ganze Datei |
| [useHistoryOverlay.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useHistoryOverlay.ts) | 0 % (0/7) | ganze Datei |
| [useJapaneseWords.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useJapaneseWords.ts) | 0 % (0/30) | ganze Datei |
| [useOnline.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useOnline.ts) | 0 % (0/6) | ganze Datei |
| [useOpenFeedbackCount.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useOpenFeedbackCount.ts) | 0 % (0/20) | ganze Datei |
| [usePageTitle.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/usePageTitle.ts) | 0 % (0/4) | ganze Datei |
| [useRecipes.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useRecipes.ts) | 0 % (0/6) | ganze Datei |
| [useScrollMemory.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useScrollMemory.ts) | 0 % (0/12) | ganze Datei |
| [useTheme.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useTheme.ts) | 0 % (0/18) | ganze Datei |
| [useTravelFolders.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useTravelFolders.ts) | 0 % (0/9) | ganze Datei |
| [useUnsavedChanges.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useUnsavedChanges.ts) | 0 % (0/11) | ganze Datei |
| [useVisitCounter.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useVisitCounter.ts) | 0 % (0/20) | ganze Datei |
| [useWakeLock.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/hooks/useWakeLock.ts) | 0 % (0/28) | ganze Datei |

</details>

<details><summary><b>utils</b> – 91,0 %, 4 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [offlineCache.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/offlineCache.ts) | 0 % (0/5) | ganze Datei |
| [resizeImage.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/resizeImage.ts) | 0 % (0/31) | ganze Datei |
| [share.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/share.ts) | 95,2 % (20/21) | [L39](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/share.ts#L39) |
| [speech.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/speech.ts) | 0 % (0/14) | ganze Datei |

Ganz getestet: [appUpdate.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/appUpdate.ts) · [backup.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/backup.ts) · [bring.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/bring.ts) · [chance.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/chance.ts) · [crossword.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/crossword.ts) · [feedback.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/feedback.ts) · [gameStats.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/gameStats.ts) · [historyOverlay.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/historyOverlay.ts) · [kana.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/kana.ts) · [kanaQuiz.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/kanaQuiz.ts) · [kanjiChoices.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/kanjiChoices.ts) · [kanjiReading.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/kanjiReading.ts) · [password.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/password.ts) · [recentPicks.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/recentPicks.ts) · [recipe.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/recipe.ts) · [recipeFilter.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/recipeFilter.ts) · [retry.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/retry.ts) · [scrollMemory.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/scrollMemory.ts) · [stats.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/stats.ts) · [storedFirst.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/storedFirst.ts) · [travel.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/travel.ts) · [visits.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/visits.ts) · [vocab.ts](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/src/utils/vocab.ts)

</details>

## Backend: 98,1 % der Zeilen getestet

2654 von 2706 Zeilen mit Code in 176 Dateien unter `backend/src/main/java/`; 152 Dateien sind ganz getestet.

| Ordner | Getestet | Dateien ganz getestet |
|---|---:|---:|
| de/jan/backup | 100 % (234/234) | 2 von 2 |
| de/jan/config | 98,5 % (258/262) | 13 von 15 |
| de/jan/controller | 100 % (169/169) | 12 von 12 |
| de/jan/controller/requests | 100 % (31/31) | 23 von 23 |
| de/jan/controller/response | 100 % (7/7) | 5 von 5 |
| de/jan/exceptions | 76,0 % (19/25) | 4 von 6 |
| de/jan/feedback | 96,2 % (25/26) | 2 von 3 |
| de/jan/feedback/repository | 100 % (33/33) | 1 von 1 |
| de/jan/games | 97,8 % (177/181) | 19 von 23 |
| de/jan/games/repository | 99,3 % (285/287) | 5 von 6 |
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

Ganz getestet: [BackupRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/backup/BackupRepository.java) · [RestoreRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/backup/RestoreRepository.java)

</details>

<details><summary><b>de/jan/config</b> – 98,5 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [AdminBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/AdminBootstrapConfig.java) | 96,6 % (28/29) | [L39](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/AdminBootstrapConfig.java#L39) |
| [UnconfirmedAccountsConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/UnconfirmedAccountsConfig.java) | 76,9 % (10/13) | [L31–L34](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/UnconfirmedAccountsConfig.java#L31-L34) |

Ganz getestet: [CloudRun.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/CloudRun.java) · [CorsConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/CorsConfig.java) · [ImageStorageConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/ImageStorageConfig.java) · [ObjectifyConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/ObjectifyConfig.java) · [ObjectifyFilterConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/ObjectifyFilterConfig.java) · [OpenApiConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/OpenApiConfig.java) · [RateLimitFilterConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/RateLimitFilterConfig.java) · [RecipeBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/RecipeBootstrapConfig.java) · [RoleBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/RoleBootstrapConfig.java) · [SecurityConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/SecurityConfig.java) · [SeedImport.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/SeedImport.java) · [TravelBootstrapConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/TravelBootstrapConfig.java) · [WebConfig.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/config/WebConfig.java)

</details>

<details><summary><b>de/jan/controller</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [BackupController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/BackupController.java) · [FavoritesController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/FavoritesController.java) · [FeedbackController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/FeedbackController.java) · [GamesController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/GamesController.java) · [ImageController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/ImageController.java) · [ImageResponse.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/ImageResponse.java) · [LicenseController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/LicenseController.java) · [RecipeController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/RecipeController.java) · [RoleController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/RoleController.java) · [StatsController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/StatsController.java) · [TravelController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/TravelController.java) · [UserController.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/UserController.java)

</details>

<details><summary><b>de/jan/controller/requests</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ChangePasswordRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/ChangePasswordRequest.java) · [ConfirmEmailRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/ConfirmEmailRequest.java) · [CrosswordResultRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/CrosswordResultRequest.java) · [DeleteAccountRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/DeleteAccountRequest.java) · [FavoriteRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/FavoriteRequest.java) · [FeedbackRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/FeedbackRequest.java) · [KanaResultRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/KanaResultRequest.java) · [KanjiResultRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/KanjiResultRequest.java) · [LoginRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/LoginRequest.java) · [PasswordResetRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/PasswordResetRequest.java) · [RecipeRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/RecipeRequest.java) · [RegisterRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/RegisterRequest.java) · [ResetPasswordRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/ResetPasswordRequest.java) · [RoleRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/RoleRequest.java) · [SetRolesRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/SetRolesRequest.java) · [TravelFolderRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/TravelFolderRequest.java) · [TravelFolderTextRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/TravelFolderTextRequest.java) · [TravelPhotoCaptionRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/TravelPhotoCaptionRequest.java) · [TravelPhotoOrderRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/TravelPhotoOrderRequest.java) · [TravelStopRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/TravelStopRequest.java) · [UpdateProfileRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/UpdateProfileRequest.java) · [VisitRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/VisitRequest.java) · [VocabResultRequest.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/requests/VocabResultRequest.java)

</details>

<details><summary><b>de/jan/controller/response</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ImageUploadResponse.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/response/ImageUploadResponse.java) · [LicenseResponse.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/response/LicenseResponse.java) · [LoginResponse.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/response/LoginResponse.java) · [RestoreResponse.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/response/RestoreResponse.java) · [StatsResponse.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/controller/response/StatsResponse.java)

</details>

<details><summary><b>de/jan/exceptions</b> – 76,0 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ErrorMailFilter.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/ErrorMailFilter.java) | 54,5 % (6/11) | [L29–L33](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/ErrorMailFilter.java#L29-L33) |
| [GlobalExceptionHandler.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/GlobalExceptionHandler.java) | 83,3 % (5/6) | [L24](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/GlobalExceptionHandler.java#L24) |

Ganz getestet: [EntityNotFoundException.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/EntityNotFoundException.java) · [EntityStateException.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/EntityStateException.java) · [UnauthenticatedException.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/UnauthenticatedException.java) · [UnauthorizedException.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/exceptions/UnauthorizedException.java)

</details>

<details><summary><b>de/jan/feedback</b> – 96,2 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Feedback.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/feedback/Feedback.java) | 94,7 % (18/19) | [L53](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/feedback/Feedback.java#L53) |

Ganz getestet: [FeedbackDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/feedback/FeedbackDAO.java) · [FeedbackDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/feedback/FeedbackDTO.java)

</details>

<details><summary><b>de/jan/feedback/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [FeedbackRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/feedback/repository/FeedbackRepository.java)

</details>

<details><summary><b>de/jan/games</b> – 97,8 %, 4 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [CrosswordStats.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/CrosswordStats.java) | 93,8 % (15/16) | [L36](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/CrosswordStats.java#L36) |
| [KanaStats.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanaStats.java) | 95,7 % (22/23) | [L47](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanaStats.java#L47) |
| [KanjiStats.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanjiStats.java) | 96,0 % (24/25) | [L47](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanjiStats.java#L47) |
| [VocabStats.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabStats.java) | 95,2 % (20/21) | [L32](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabStats.java#L32) |

Ganz getestet: [CrosswordStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/CrosswordStatsDAO.java) · [CrosswordStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/CrosswordStatsDTO.java) · [KanaMistake.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanaMistake.java) · [KanaMistakeDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanaMistakeDTO.java) · [KanaStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanaStatsDAO.java) · [KanaStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanaStatsDTO.java) · [KanjiMistake.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanjiMistake.java) · [KanjiMistakeDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanjiMistakeDTO.java) · [KanjiStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanjiStatsDAO.java) · [KanjiStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/KanjiStatsDTO.java) · [Mistake.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/Mistake.java) · [VocabCard.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabCard.java) · [VocabCardDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabCardDTO.java) · [VocabMistake.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabMistake.java) · [VocabMistakeDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabMistakeDTO.java) · [VocabProgress.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabProgress.java) · [VocabProgressDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabProgressDAO.java) · [VocabStatsDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabStatsDAO.java) · [VocabStatsDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/VocabStatsDTO.java)

</details>

<details><summary><b>de/jan/games/repository</b> – 99,3 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [VocabStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/VocabStatsRepository.java) | 97,7 % (84/86) | [L75](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/VocabStatsRepository.java#L75) · [L118](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/VocabStatsRepository.java#L118) |

Ganz getestet: [CrosswordStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/CrosswordStatsRepository.java) · [KanaStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/KanaStatsRepository.java) · [KanjiStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/KanjiStatsRepository.java) · [MistakeList.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/MistakeList.java) · [MistakeStatsRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/games/repository/MistakeStatsRepository.java)

</details>

<details><summary><b>de/jan/image</b> – 95,3 %, 3 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [ImageScaler.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/ImageScaler.java) | 94,1 % (32/34) | [L77–L78](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/ImageScaler.java#L77-L78) |
| [ImageType.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/ImageType.java) | 95,5 % (21/22) | [L42](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/ImageType.java#L42) |
| [RecipeImageRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/RecipeImageRepository.java) | 93,5 % (29/31) | [L73–L74](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/RecipeImageRepository.java#L73-L74) |

Ganz getestet: [RecipeImage.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/RecipeImage.java) · [RecipeImageDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/RecipeImageDAO.java) · [StoredImage.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/image/StoredImage.java)

</details>

<details><summary><b>de/jan/license</b> – 92,9 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [LicenseRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/license/LicenseRepository.java) | 92,9 % (26/28) | [L43–L44](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/license/LicenseRepository.java#L43-L44) |

</details>

<details><summary><b>de/jan/mail</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [AbstractMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/AbstractMailService.java) · [AdminMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/AdminMailService.java) · [BrevoMailSender.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/BrevoMailSender.java) · [ConfirmationMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/ConfirmationMailService.java) · [ErrorMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/ErrorMailService.java) · [FeedbackMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/FeedbackMailService.java) · [LinkMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/LinkMailService.java) · [MailTemplate.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/MailTemplate.java) · [MailTemplates.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/MailTemplates.java) · [PasswordResetMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/PasswordResetMailService.java) · [RegistrationMailService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/RegistrationMailService.java) · [Sender.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/mail/Sender.java)

</details>

<details><summary><b>de/jan/objectify</b> – 89,7 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [BaseDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/objectify/BaseDAO.java) | 95,7 % (45/47) | [L37](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/objectify/BaseDAO.java#L37) · [L69](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/objectify/BaseDAO.java#L69) |
| [Filter.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/objectify/Filter.java) | 76,2 % (16/21) | [L36](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/objectify/Filter.java#L36) · [L44–L56](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/objectify/Filter.java#L44-L56) |

</details>

<details><summary><b>de/jan/recipe</b> – 89,4 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Recipe.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/Recipe.java) | 96,4 % (27/28) | [L41](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/Recipe.java#L41) |
| [RecipeSeedMarker.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java) | 50,0 % (4/8) | [L24–L26](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java#L24-L26) · [L33–L34](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/RecipeSeedMarker.java#L33-L34) |

Ganz getestet: [RecipeDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/RecipeDAO.java) · [RecipeDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/RecipeDTO.java) · [RecipeSeedMarkerDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/RecipeSeedMarkerDAO.java) · [RecipeTag.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/RecipeTag.java)

</details>

<details><summary><b>de/jan/recipe/favorites</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [FavoritesRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/favorites/FavoritesRepository.java)

</details>

<details><summary><b>de/jan/recipe/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [RecipeRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/repository/RecipeRepository.java) · [RecipeSeedMarkerRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/recipe/repository/RecipeSeedMarkerRepository.java)

</details>

<details><summary><b>de/jan/role</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [Permission.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/role/Permission.java) · [Role.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/role/Role.java) · [RoleDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/role/RoleDAO.java) · [RoleDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/role/RoleDTO.java)

</details>

<details><summary><b>de/jan/role/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [RoleRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/role/repository/RoleRepository.java)

</details>

<details><summary><b>de/jan/security</b> – 99,2 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [Authorization.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/security/Authorization.java) | 93,8 % (15/16) | [L26](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/security/Authorization.java#L26) |

Ganz getestet: [CurrentUserArgumentResolver.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/security/CurrentUserArgumentResolver.java) · [JwtService.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/security/JwtService.java) · [LoginRateLimitFilter.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/security/LoginRateLimitFilter.java) · [RateLimiter.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/security/RateLimiter.java)

</details>

<details><summary><b>de/jan/stats</b> – 92,3 %, 1 Datei mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [VisitDay.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/stats/VisitDay.java) | 90,9 % (10/11) | [L37](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/stats/VisitDay.java#L37) |

Ganz getestet: [VisitDayDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/stats/VisitDayDAO.java)

</details>

<details><summary><b>de/jan/stats/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [VisitDayRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/stats/repository/VisitDayRepository.java)

</details>

<details><summary><b>de/jan/travel</b> – 94,8 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [TravelFolder.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelFolder.java) | 97,0 % (32/33) | [L104](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelFolder.java#L104) |
| [TravelSeedMarker.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelSeedMarker.java) | 50,0 % (4/8) | [L24–L26](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelSeedMarker.java#L24-L26) · [L33–L34](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelSeedMarker.java#L33-L34) |

Ganz getestet: [TravelFolderDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelFolderDAO.java) · [TravelFolderDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelFolderDTO.java) · [TravelPhoto.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelPhoto.java) · [TravelPhotoDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelPhotoDAO.java) · [TravelPhotoDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelPhotoDTO.java) · [TravelPhotoFile.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelPhotoFile.java) · [TravelPhotoFileDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelPhotoFileDAO.java) · [TravelPhotoPreview.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelPhotoPreview.java) · [TravelPhotoPreviewDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelPhotoPreviewDAO.java) · [TravelSeedMarkerDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelSeedMarkerDAO.java) · [TravelStop.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelStop.java) · [TravelStopDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/TravelStopDTO.java)

</details>

<details><summary><b>de/jan/travel/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [TravelFolderRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/repository/TravelFolderRepository.java) · [TravelPhotoFileRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/repository/TravelPhotoFileRepository.java) · [TravelPhotoPreviewRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/repository/TravelPhotoPreviewRepository.java) · [TravelPhotoRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/repository/TravelPhotoRepository.java) · [TravelSeedMarkerRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/travel/repository/TravelSeedMarkerRepository.java)

</details>

<details><summary><b>de/jan/user</b> – 89,4 %, 2 Dateien mit Lücken</summary>

| Datei | Getestet | Nicht getestete Zeilen |
|---|---:|---|
| [MailLinkToken.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/MailLinkToken.java) | 83,3 % (10/12) | [L40](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/MailLinkToken.java#L40) · [L52](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/MailLinkToken.java#L52) |
| [User.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/User.java) | 83,3 % (35/42) | [L78–L79](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/User.java#L78-L79) · [L108](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/User.java#L108) · [L120](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/User.java#L120) · [L126–L127](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/User.java#L126-L127) · [L142](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/User.java#L142) |

Ganz getestet: [EmailConfirmationToken.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/EmailConfirmationToken.java) · [EmailConfirmationTokenDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/EmailConfirmationTokenDAO.java) · [MailLinkTokenDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/MailLinkTokenDAO.java) · [PasswordResetToken.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/PasswordResetToken.java) · [PasswordResetTokenDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/PasswordResetTokenDAO.java) · [UserAdminDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/UserAdminDTO.java) · [UserDAO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/UserDAO.java) · [UserDTO.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/UserDTO.java)

</details>

<details><summary><b>de/jan/user/repository</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [EmailConfirmationRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/repository/EmailConfirmationRepository.java) · [MailLinks.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/repository/MailLinks.java) · [OneTimeToken.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/repository/OneTimeToken.java) · [PasswordResetRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/repository/PasswordResetRepository.java) · [UserRepository.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/user/repository/UserRepository.java)

</details>

<details><summary><b>de/jan/util</b> – 100 %, 0 Dateien mit Lücken</summary>

Ganz getestet: [ListCache.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/util/ListCache.java) · [TextCleaner.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/util/TextCleaner.java) · [TextRules.java](https://github.com/JanR99/jan-website-react/blob/9aa625189838e4f3d218c61965eef89be4db9f40/backend/src/main/java/de/jan/util/TextRules.java)

</details>
