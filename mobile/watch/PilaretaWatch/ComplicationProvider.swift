import ClockKit
import SwiftUI

class ComplicationProvider: NSObject, CLKComplicationDataSource {

    // MARK: - Complication Descriptors

    func getComplicationDescriptors(handler: @escaping ([CLKComplicationDescriptor]) -> Void) {
        let descriptors = [
            CLKComplicationDescriptor(
                identifier: "streak",
                displayName: "Workout Streak",
                supportedFamilies: [
                    .circularSmall,
                    .modularSmall,
                    .graphicCircular,
                    .graphicCorner,
                    .graphicRectangular
                ]
            ),
            CLKComplicationDescriptor(
                identifier: "calories",
                displayName: "Today's Calories",
                supportedFamilies: [
                    .circularSmall,
                    .modularSmall,
                    .graphicCircular
                ]
            )
        ]
        handler(descriptors)
    }

    // MARK: - Timeline Entry

    func getCurrentTimelineEntry(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void) {
        let streak = UserDefaults.standard.integer(forKey: "cached_streak")
        let calories = UserDefaults.standard.integer(forKey: "cached_calories")

        switch complication.identifier {
        case "streak":
            handler(makeStreakEntry(streak: streak, complication: complication))
        case "calories":
            handler(makeCaloriesEntry(calories: calories, complication: complication))
        default:
            handler(nil)
        }
    }

    // MARK: - Streak Complication Templates

    private func makeStreakEntry(streak: Int, complication: CLKComplication) -> CLKComplicationTimelineEntry? {
        let date = Date()

        switch complication.family {
        case .graphicCircular:
            let template = CLKComplicationTemplateGraphicCircularStackText(
                line1TextProvider: CLKTextProvider(format: "\u{1F525}"),
                line2TextProvider: CLKTextProvider(format: "%d days", streak)
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .circularSmall:
            let template = CLKComplicationTemplateCircularSmallStackText(
                line1TextProvider: CLKTextProvider(format: "\u{1F525}%d", streak),
                line2TextProvider: CLKTextProvider(format: "streak")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .modularSmall:
            let template = CLKComplicationTemplateModularSmallStackText(
                line1TextProvider: CLKTextProvider(format: "\u{1F525}%d", streak),
                line2TextProvider: CLKTextProvider(format: "streak")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .graphicCorner:
            let template = CLKComplicationTemplateGraphicCornerStackText(
                innerTextProvider: CLKTextProvider(format: "%d day streak", streak),
                outerTextProvider: CLKTextProvider(format: "\u{1F525} Pilareta")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .graphicRectangular:
            let template = CLKComplicationTemplateGraphicRectangularStandardBody(
                headerTextProvider: CLKTextProvider(format: "Pilareta Streak"),
                body1TextProvider: CLKTextProvider(format: "\u{1F525} %d day streak", streak),
                body2TextProvider: CLKTextProvider(format: "Keep it going!")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        default:
            return nil
        }
    }

    // MARK: - Calories Complication Templates

    private func makeCaloriesEntry(calories: Int, complication: CLKComplication) -> CLKComplicationTimelineEntry? {
        let date = Date()

        switch complication.family {
        case .graphicCircular:
            let template = CLKComplicationTemplateGraphicCircularStackText(
                line1TextProvider: CLKTextProvider(format: "\u{1F525}"),
                line2TextProvider: CLKTextProvider(format: "%d cal", calories)
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .circularSmall:
            let template = CLKComplicationTemplateCircularSmallStackText(
                line1TextProvider: CLKTextProvider(format: "%d", calories),
                line2TextProvider: CLKTextProvider(format: "cal")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        case .modularSmall:
            let template = CLKComplicationTemplateModularSmallStackText(
                line1TextProvider: CLKTextProvider(format: "%d", calories),
                line2TextProvider: CLKTextProvider(format: "cal")
            )
            return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)

        default:
            return nil
        }
    }

    // MARK: - Privacy

    func getPrivacyBehavior(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void) {
        handler(.showOnLockScreen)
    }

    // MARK: - Timeline Configuration

    func getTimelineEndDate(for complication: CLKComplication, withHandler handler: @escaping (Date?) -> Void) {
        // Refresh every hour
        handler(Date().addingTimeInterval(3600))
    }

    func getLocalizableSampleTemplate(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTemplate?) -> Void) {
        switch complication.identifier {
        case "streak":
            if complication.family == .graphicCircular {
                let template = CLKComplicationTemplateGraphicCircularStackText(
                    line1TextProvider: CLKTextProvider(format: "\u{1F525}"),
                    line2TextProvider: CLKTextProvider(format: "12 days")
                )
                handler(template)
            } else if complication.family == .graphicRectangular {
                let template = CLKComplicationTemplateGraphicRectangularStandardBody(
                    headerTextProvider: CLKTextProvider(format: "Pilareta Streak"),
                    body1TextProvider: CLKTextProvider(format: "\u{1F525} 12 day streak"),
                    body2TextProvider: CLKTextProvider(format: "Keep it going!")
                )
                handler(template)
            } else {
                handler(nil)
            }
        case "calories":
            if complication.family == .graphicCircular {
                let template = CLKComplicationTemplateGraphicCircularStackText(
                    line1TextProvider: CLKTextProvider(format: "\u{1F525}"),
                    line2TextProvider: CLKTextProvider(format: "320 cal")
                )
                handler(template)
            } else {
                handler(nil)
            }
        default:
            handler(nil)
        }
    }
}
