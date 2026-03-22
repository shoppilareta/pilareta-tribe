import SwiftUI
import WatchConnectivity
import WatchKit
import ClockKit

@main
struct PilaretaWatchApp: App {
    @StateObject private var workoutManager = WorkoutManager()
    @WKApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    init() {
        // Activate WCSession early for fastest connectivity
        if WCSession.isSupported() {
            WCSession.default.activate()
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(workoutManager)
                .onAppear {
                    workoutManager.requestHealthKitPermission()
                    workoutManager.updatePendingSyncCount()
                }
        }
    }
}

// MARK: - App Delegate for Background Refresh

class AppDelegate: NSObject, WKApplicationDelegate {

    /// Schedule periodic background refresh to keep complications and cached data up-to-date
    func applicationDidFinishLaunching() {
        scheduleBackgroundRefresh()
    }

    func applicationDidBecomeActive() {
        // Refresh complication data when app becomes active
        reloadComplications()
    }

    /// Called by the system for scheduled background tasks
    func handle(_ backgroundTasks: Set<WKRefreshBackgroundTask>) {
        for task in backgroundTasks {
            switch task {
            case let refreshTask as WKApplicationRefreshBackgroundTask:
                // Update cached stats and complications
                reloadComplications()
                scheduleBackgroundRefresh()
                refreshTask.setTaskCompletedWithSnapshot(false)

            case let snapshotTask as WKSnapshotRefreshBackgroundTask:
                snapshotTask.setTaskCompleted(restoredDefaultState: true, estimatedSnapshotExpiration: Date.distantFuture, userInfo: nil)

            default:
                task.setTaskCompletedWithSnapshot(false)
            }
        }
    }

    /// Schedule the next background refresh (every 30 minutes)
    private func scheduleBackgroundRefresh() {
        let targetDate = Date().addingTimeInterval(30 * 60)
        WKApplication.shared().scheduleBackgroundRefresh(
            withPreferredDate: targetDate,
            userInfo: nil
        ) { error in
            if let error = error {
                print("[BackgroundRefresh] Failed to schedule: \(error.localizedDescription)")
            } else {
                print("[BackgroundRefresh] Scheduled for \(targetDate)")
            }
        }
    }

    /// Reload all active complications to show fresh data
    private func reloadComplications() {
        let server = CLKComplicationServer.sharedInstance()
        guard let activeComplications = server.activeComplications else { return }
        for complication in activeComplications {
            server.reloadTimeline(for: complication)
        }
    }
}
