const BADGES = [
    {
        id: 'first_workout',
        title: 'First Step',
        description: 'Complete your first workout',
        icon: '👟',
        condition: (user, stats) => stats.totalWorkouts >= 1
    },
    {
        id: 'streak_3',
        title: 'Consistency Is Key',
        description: 'Reach a 3-day streak',
        icon: '🌱',
        condition: (user, stats) => user.streak >= 3
    },
    {
        id: 'streak_7',
        title: 'On Fire',
        description: 'Reach a 7-day streak',
        icon: '🔥',
        condition: (user, stats) => user.streak >= 7
    },
    {
        id: 'streak_30',
        title: 'Unstoppable',
        description: 'Reach a 30-day streak',
        icon: '🚀',
        condition: (user, stats) => user.streak >= 30
    },
    {
        id: 'cal_5000',
        title: 'Burner',
        description: 'Burn 5,000 total calories',
        icon: '⚡',
        condition: (user, stats) => stats.totalCalories >= 5000
    },
    {
        id: 'cal_20000',
        title: 'Inferno',
        description: 'Burn 20,000 total calories',
        icon: '🌋',
        condition: (user, stats) => stats.totalCalories >= 20000
    },
    {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete a workout before 6 AM',
        icon: '🌅',
        condition: (user, stats) => {
            if (!stats.lastWorkout) return false;
            const hour = new Date(stats.lastWorkout.date).getHours();
            return hour < 6;
        }
    },
    {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Complete a workout after 10 PM',
        icon: '🦉',
        condition: (user, stats) => {
            if (!stats.lastWorkout) return false;
            const hour = new Date(stats.lastWorkout.date).getHours();
            return hour >= 22;
        }
    },
    {
        id: 'weekend_warrior',
        title: 'Weekend Warrior',
        description: 'Complete workouts on Saturday and Sunday',
        icon: '⚔️',
        condition: (user, stats) => {
            // This is complex to check stat-less, assuming simplistic check for now or skipping
            return false;
        }
    }
];

/**
 * Check for new achievements
 * @param {Object} profile - The Mongoose profile object
 * @param {Object} stats - Calculated stats { totalWorkouts, totalCalories, lastWorkout }
 * @returns {Array} - Array of new badges awarded
 */
const checkAchievements = (profile, stats) => {
    const newBadges = [];
    const existingIds = (profile.achievements || []).map(a => a.id);

    BADGES.forEach(badge => {
        if (!existingIds.includes(badge.id)) {
            // condition(profile, stats) because we moved streak to profile
            if (badge.condition(profile, stats)) {
                newBadges.push({
                    id: badge.id,
                    title: badge.title,
                    description: badge.description,
                    icon: badge.icon,
                    date: new Date()
                });
            }
        }
    });

    return newBadges;
};

/**
 * Get next missions (locked badges logic)
 * @param {Object} profile 
 * @returns {Array} List of locked badges
 */
const getNextMissions = (profile) => {
    const existingIds = (profile.achievements || []).map(a => a.id);
    return BADGES.filter(b => !existingIds.includes(b.id)).slice(0, 3); // Return top 3 next missions
};

module.exports = {
    checkAchievements,
    getNextMissions
};
