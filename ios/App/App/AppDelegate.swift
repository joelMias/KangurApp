import UIKit
import Capacitor
import FirebaseCore

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        if let filePath = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") {
            print("Fichero encontrado en: \(filePath)")
            if let options = FirebaseOptions(contentsOfFile: filePath) {
                FirebaseApp.configure(options: options)
                print("Firebase configurado correctamente con opciones manuales.")
            }
        } else {
            print("ERROR CRÍTICO: El archivo GoogleService-Info.plist no existe en el paquete de la app.")
        }

        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}