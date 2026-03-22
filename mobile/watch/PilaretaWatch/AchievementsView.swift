import SwiftUI
import WatchKit

struct Achievement: Identifiable {
    let id: String
    let name: String
    let icon: String
    let description: String
    let requirement: String
    var unlocked: Bool
    var unlockedDate: Date?
}

struct AchievementsView: View {
    @EnvironmentObject var workoutManager: WorkoutManager

    var achievements: [Achievement] {
        let streak = workoutManager.currentStreak
        let totalWorkouts = UserDefaults.standard.integer(forKey: "total_workouts_logged")

        return [
            Achievement(id: "first_workout", name: "First Step", icon: "\u{1F3C3}", description: "Log your first workout", requirement: "1 workout", unlocked: totalWorkouts >= 1),
            Achievement(id: "streak_7", name: "Week Warrior", icon: "\u{1F525}", description: "7-day workout streak", requirement: "7-day streak", unlocked: streak >= 7 || UserDefaults.standard.bool(forKey: "badge_streak_7")),
            Achievement(id: "streak_14", name: "Consistency King", icon: "\u{1F451}", description: "14-day workout streak", requirement: "14-day streak", unlocked: streak >= 14 || UserDefaults.standard.bool(forKey: "badge_streak_14")),
            Achievement(id: "streak_30", name: "Monthly Master", icon: "\u{1F3C6}", description: "30-day workout streak", requirement: "30-day streak", unlocked: streak >= 30 || UserDefaults.standard.bool(forKey: "badge_streak_30")),
            Achievement(id: "workouts_10", name: "Getting Started", icon: "\u{2B50}", description: "Complete 10 workouts", requirement: "10 workouts", unlocked: totalWorkouts >= 10),
            Achievement(id: "workouts_50", name: "Dedicated", icon: "\u{1F48E}", description: "Complete 50 workouts", requirement: "50 workouts", unlocked: totalWorkouts >= 50),
            Achievement(id: "workouts_100", name: "Century Club", icon: "\u{1F3AF}", description: "Complete 100 workouts", requirement: "100 workouts", unlocked: totalWorkouts >= 100),
            Achievement(id: "early_bird", name: "Early Bird", icon: "\u{1F305}", description: "Workout before 7 AM", requirement: "Pre-7AM workout", unlocked: UserDefaults.standard.bool(forKey: "badge_early_bird")),
        ]
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                Text("Achievements")
                    .font(.headline)
                    .foregroundColor(Color(hex: "f6eddd"))

                Text("\(achievements.filter(\.unlocked).count)/\(achievements.count) unlocked")
                    .font(.caption)
                    .foregroundColor(Color(hex: "f6eddd").opacity(0.5))

                ForEach(achievements) { badge in
                    HStack(spacing: 10) {
                        Text(badge.icon)
                            .font(.title3)
                            .opacity(badge.unlocked ? 1.0 : 0.3)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(badge.name)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(Color(hex: "f6eddd").opacity(badge.unlocked ? 1.0 : 0.4))
                            Text(badge.unlocked ? badge.description : badge.requirement)
                                .font(.system(size: 10))
                                .foregroundColor(Color(hex: "f6eddd").opacity(badge.unlocked ? 0.6 : 0.3))
                        }

                        Spacer()

                        if badge.unlocked {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                                .font(.caption)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .padding(.horizontal, 8)
        }
    }
}
