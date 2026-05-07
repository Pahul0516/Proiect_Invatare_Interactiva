export interface Achievement {
    id: string;
    icon: string;
    title: string;
    description: string;
    coinReward: number;
    xpReward: number;
    hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    // Progress
    { id: "first_adventure", icon: "🏅", title: "Prima Aventură", description: "Completează primul județ", coinReward: 50, xpReward: 1 },
    { id: "explorer_5", icon: "🗺️", title: "Explorator", description: "Completează 5 județe", coinReward: 100, xpReward: 2 },
    { id: "explorer_10", icon: "🧭", title: "Călător Experimentat", description: "Completează 10 județe", coinReward: 200, xpReward: 3 },
    { id: "explorer_20", icon: "🌍", title: "Globetrotter", description: "Completează 20 județe", coinReward: 500, xpReward: 5 },
    { id: "explorer_41", icon: "👑", title: "Maestrul României", description: "Completează toate cele 41 de județe", coinReward: 2000, xpReward: 20 },

    // Perfect scores
    { id: "perfect_1", icon: "🌟", title: "Perfectionist", description: "Obține 20/20 la un quiz", coinReward: 100, xpReward: 2 },
    { id: "perfect_5", icon: "💎", title: "Diamant", description: "Obține 20/20 la 5 quiz-uri", coinReward: 300, xpReward: 5 },
    { id: "perfect_10", icon: "🔮", title: "Clarvăzător", description: "Obține 20/20 la 10 quiz-uri", coinReward: 500, xpReward: 8 },

    // Streaks
    { id: "streak_5", icon: "🔥", title: "Serie de Foc", description: "5 răspunsuri corecte la rând", coinReward: 50, xpReward: 1 },
    { id: "streak_10", icon: "⚡", title: "Neînfricat", description: "10 răspunsuri corecte la rând", coinReward: 150, xpReward: 3 },
    { id: "streak_20", icon: "💥", title: "Invincibil", description: "20 răspunsuri corecte la rând (perfect quiz!)", coinReward: 500, xpReward: 5 },

    // Coins
    { id: "coins_500", icon: "💰", title: "Economisitor", description: "Acumulează 500 de monede", coinReward: 50, xpReward: 1 },
    { id: "coins_2000", icon: "🏦", title: "Bancher", description: "Acumulează 2000 de monede", coinReward: 100, xpReward: 2 },
    { id: "coins_5000", icon: "💸", title: "Milionar", description: "Acumulează 5000 de monede", coinReward: 200, xpReward: 3 },

    // Daily
    { id: "daily_1", icon: "📅", title: "Primul Daily", description: "Completează prima provocare zilnică", coinReward: 50, xpReward: 1 },
    { id: "daily_streak_3", icon: "🗓️", title: "Dedicat", description: "3 zile consecutive", coinReward: 100, xpReward: 2 },
    { id: "daily_streak_7", icon: "📆", title: "Săptămâna Perfectă", description: "7 zile consecutive", coinReward: 300, xpReward: 5 },
    { id: "daily_streak_30", icon: "🏆", title: "Legendă Lunară", description: "30 de zile consecutive", coinReward: 1000, xpReward: 10 },

    // Power-ups
    { id: "first_powerup", icon: "🛒", title: "Prima Achiziție", description: "Cumpără primul power-up", coinReward: 30, xpReward: 1 },
    { id: "use_shield", icon: "🛡️", title: "Protejat", description: "Folosește un Shield în quiz", coinReward: 30, xpReward: 1 },
    { id: "use_freeze", icon: "❄️", title: "Timpul Îngheață", description: "Folosește Time Freeze în quiz", coinReward: 30, xpReward: 1 },

    // Level milestones
    { id: "level_5", icon: "📊", title: "Nivel 5", description: "Ajunge la nivelul 5", coinReward: 100, xpReward: 0 },
    { id: "level_10", icon: "📈", title: "Nivel 10", description: "Ajunge la nivelul 10", coinReward: 200, xpReward: 0 },
    { id: "level_25", icon: "🚀", title: "Nivel 25", description: "Ajunge la nivelul 25", coinReward: 500, xpReward: 0 },
    { id: "level_50", icon: "🌌", title: "Nivel Maxim", description: "Ajunge la nivelul 50", coinReward: 2000, xpReward: 0 },

    // Speed
    { id: "speed_demon", icon: "⏱️", title: "Speed Demon", description: "Răspunde la toate 20 întrebările cu >10s rămase", coinReward: 200, xpReward: 3 },

    // Misc/hidden
    { id: "night_owl", icon: "🦉", title: "Pasărea de Noapte", description: "Joacă între 00:00 și 05:00", coinReward: 50, xpReward: 1, hidden: true },
    { id: "early_bird", icon: "🐦", title: "Pasărea Timpurie", description: "Joacă între 05:00 și 07:00", coinReward: 50, xpReward: 1, hidden: true },
    { id: "collector", icon: "🎖️", title: "Colecționar", description: "Deblochează 15 realizări", coinReward: 300, xpReward: 5 },
    { id: "master_collector", icon: "🏅", title: "Maestru Colecționar", description: "Deblochează toate realizările", coinReward: 1000, xpReward: 10, hidden: true },

    // Questions
    { id: "questions_100", icon: "❓", title: "Curios", description: "Răspunde la 100 de întrebări", coinReward: 100, xpReward: 2 },
    { id: "questions_500", icon: "🧠", title: "Erudit", description: "Răspunde la 500 de întrebări", coinReward: 300, xpReward: 5 },
    { id: "questions_1000", icon: "🎓", title: "Profesor", description: "Răspunde la 1000 de întrebări", coinReward: 500, xpReward: 8 },
];

export interface CheckContext {
    totalCompleted: number;
    greenCount: number;
    bestStreak: number;
    totalCoins: number;
    dailyStreak: number;
    dailyChallengesCompleted: number;
    totalPowerUpsBought: number;
    usedShield: boolean;
    usedFreeze: boolean;
    level: number;
    totalQuestionsAnswered: number;
    unlockedAchievements: string[];
    currentHour: number;
    allTimerAbove10: boolean;
}

export function checkAchievements(ctx: CheckContext): string[] {
    const newlyUnlocked: string[] = [];
    const already = new Set(ctx.unlockedAchievements);

    const check = (id: string, condition: boolean) => {
        if (!already.has(id) && condition) {
            newlyUnlocked.push(id);
        }
    };

    check("first_adventure", ctx.totalCompleted >= 1);
    check("explorer_5", ctx.totalCompleted >= 5);
    check("explorer_10", ctx.totalCompleted >= 10);
    check("explorer_20", ctx.totalCompleted >= 20);
    check("explorer_41", ctx.totalCompleted >= 41);

    check("perfect_1", ctx.greenCount >= 1);
    check("perfect_5", ctx.greenCount >= 5);
    check("perfect_10", ctx.greenCount >= 10);

    check("streak_5", ctx.bestStreak >= 5);
    check("streak_10", ctx.bestStreak >= 10);
    check("streak_20", ctx.bestStreak >= 20);

    check("coins_500", ctx.totalCoins >= 500);
    check("coins_2000", ctx.totalCoins >= 2000);
    check("coins_5000", ctx.totalCoins >= 5000);

    check("daily_1", ctx.dailyChallengesCompleted >= 1);
    check("daily_streak_3", ctx.dailyStreak >= 3);
    check("daily_streak_7", ctx.dailyStreak >= 7);
    check("daily_streak_30", ctx.dailyStreak >= 30);

    check("first_powerup", ctx.totalPowerUpsBought >= 1);
    check("use_shield", ctx.usedShield);
    check("use_freeze", ctx.usedFreeze);

    check("level_5", ctx.level >= 5);
    check("level_10", ctx.level >= 10);
    check("level_25", ctx.level >= 25);
    check("level_50", ctx.level >= 50);

    check("speed_demon", ctx.allTimerAbove10);

    check("night_owl", ctx.currentHour >= 0 && ctx.currentHour < 5);
    check("early_bird", ctx.currentHour >= 5 && ctx.currentHour < 7);

    check("questions_100", ctx.totalQuestionsAnswered >= 100);
    check("questions_500", ctx.totalQuestionsAnswered >= 500);
    check("questions_1000", ctx.totalQuestionsAnswered >= 1000);

    // Meta-achievements (count AFTER adding the above)
    const totalUnlocked = ctx.unlockedAchievements.length + newlyUnlocked.length;
    check("collector", totalUnlocked >= 15);
    // master_collector only if ALL others are unlocked
    check("master_collector", totalUnlocked >= ACHIEVEMENTS.length - 1);

    return newlyUnlocked;
}

// Level XP thresholds (exponential curve)
export function getXpForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(10 * Math.pow(1.35, level - 1));
}

export function getLevelFromXp(xp: number): number {
    let level = 1;
    while (level < 50 && xp >= getXpForLevel(level + 1)) {
        level++;
    }
    return level;
}

export function getXpProgress(xp: number, level: number): { current: number; needed: number; percent: number } {
    if (level >= 50) return { current: 0, needed: 0, percent: 100 };
    const currentLevelXp = getXpForLevel(level);
    const nextLevelXp = getXpForLevel(level + 1);
    const needed = nextLevelXp - currentLevelXp;
    const current = xp - currentLevelXp;
    return { current, needed, percent: Math.min(100, Math.round((current / needed) * 100)) };
}
