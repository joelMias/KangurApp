import UIKit
import Capacitor
import FirebaseCore // Importante para la configuración manual

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let options = FirebaseOptions(googleAppID: "1:600666214184:ios:39f802a6be99af5c4d0a1d", gcmSenderID: "600666214184")
        options.apiKey = "AIzaSyDeHpLU-z_6zo3uhrj0dVm8lth78qFKIbU"
        options.projectID = "kangurapp-b452e"
        options.bundleID = "com.kangurapp.app"
        options.storageBucket = "kangurapp-b452e.firebasestorage.app"
        
        FirebaseApp.configure(options: options)
        
        print("¡Victoria! Firebase configurado manualmente sin depender del archivo.")
        
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}