// ---------- Users and roles ----------

interface UserDTO {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
}

type Permission = "MANAGE_RECIPES" | "MANAGE_TRAVEL" | "MANAGE_USERS" | "EXPORT_DATA" | "MANAGE_FEEDBACK" | "VIEW_STATS";

interface RoleDTO {
    id: number;
    name: string;
    permissions: Permission[];
    system: boolean;
}

interface UserAdminDTO {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    roleIds: number[];
}

// ---------- Recipes ----------

type RecipeTag = "VEGETARIAN" | "VEGAN";

interface Recipe {
    id: number;
    title: string;
    image: string;
    defaultPortions: number;
    ingredients: string[];
    preparation: string[];
    cuisine: string;
    tags: RecipeTag[];
    relatedRecipeIds: number[];
}

// ---------- Travel diary ----------

interface TravelPosition {
    latitude: number;
    longitude: number;
}

interface TravelStop extends TravelPosition {
    name: string;
}

interface TravelPhoto {
    id: number;
    caption: string;
}

interface TravelFolder {
    id: number;
    name: string;
    country: string;
    coverPhotoId: number | null;
    stops: TravelStop[];
    previousFolderId: number | null;
    startMonth: string | null;
    endMonth: string | null;
    text: string;
    cuisine: string;
    photos: TravelPhoto[];
}

// ---------- Feedback ----------

interface FeedbackDTO {
    id: number;
    userName: string;
    userEmail: string;
    text: string;
    page: string;
    createdAt: string | null;
    done: boolean;
}

// ---------- Games ----------

type CrosswordScript = "hiragana" | "katakana";

interface CrosswordLevelStats {
    script: CrosswordScript;
    level: string;
    solved: number;
    words: number;
}

interface CrosswordStats {
    solved: number;
    words: number;
    currentStreak: number;
    bestStreak: number;
    levels: CrosswordLevelStats[];
}

interface KanjiLevelStats {
    level: string;
    rounds: number;
    perfectRounds: number;
    rightWords: number;
    askedWords: number;
}

interface KanjiStats {
    rounds: number;
    perfectRounds: number;
    rightWords: number;
    askedWords: number;
    currentStreak: number;
    bestStreak: number;
    levels: KanjiLevelStats[];
}

interface KanjiMistake {
    word: string;
    reading: string;
    meaning: string;
    wrong: number;
    rightInRow: number;
}

interface KanaScriptStats {
    script: "hiragana" | "katakana";
    rightKana: number;
    askedKana: number;
}

interface KanaStats {
    rounds: number;
    perfectRounds: number;
    rightKana: number;
    askedKana: number;
    currentStreak: number;
    bestStreak: number;
    scripts: KanaScriptStats[];
}

interface KanaMistake {
    kana: string;
    wrong: number;
    rightInRow: number;
}
