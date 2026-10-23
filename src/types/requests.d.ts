// ---------- Recipes ----------

type RecipeRequest = Omit<Recipe, "id">;

interface ImageUploadResponse {
    image: string;
}

// ---------- Travel diary ----------

interface PlaceSearchResult extends TravelPosition {
    label: string;
}

interface TravelFolderRequest {
    name: string;
    country: string;
    stops: TravelStop[];
    previousFolderId: number | null;
    startMonth: string | null;
    endMonth: string | null;
    cuisine: string;
}

// ---------- Users and roles ----------

interface RegisterRequest {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

interface LoginResponse {
    token: string;
    user: UserDTO;
}

interface PasswordResetRequest {
    email: string;
}

interface ResetPasswordRequest {
    token: string;
    password: string;
}

interface UpdateProfileRequest {
    firstname: string;
    lastname: string;
}

interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

interface DeleteAccountRequest {
    password: string;
}

interface RoleRequest {
    name: string;
    permissions: Permission[];
}

interface SetRolesRequest {
    email: string;
    roleIds: number[];
}

// ---------- Feedback ----------

interface FeedbackRequest {
    text: string;
    page: string;
}

// ---------- Games ----------

interface CrosswordResult {
    script: CrosswordScript;
    level: string;
    solved: boolean;
    rightWords: number;
}

interface KanjiResultWord {
    word: string;
    reading: string;
    meaning: string;
}

interface KanjiResult {
    level?: string;
    answers: boolean[];
    words?: KanjiResultWord[];
    practice?: boolean;
}

interface KanaResult {
    answers: boolean[];
    kana: string[];
    practice?: boolean;
}

// ---------- Backup ----------

interface RestoreResult {
    recipes: number;
    folders: number;
    photos: number;
    skippedRecipes: string[];
    skippedFolders: string[];
    skippedPhotos: number;
}

// ---------- Licenses ----------

interface LicenseResponse {
    name: string;
    artifact: string;
    version: string;
    licenses: string[];
    url: string | null;
}
