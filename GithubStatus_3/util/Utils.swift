//
//  Utils.swift
//  GithubStatus_3
//
//  Created by 张佳皓 on 2018/8/5.
//  Copyright © 2018年 张佳皓. All rights reserved.
//

import Foundation
import WebKit

class Utils {
    static let DEFAULT_USER = "zjhch123"
    
    static func getUser() -> String {
        let user = UserDefaults.standard.string(forKey: "user") ?? DEFAULT_USER
        return user
    }
    
    static func setUser(username: String) {
        UserDefaults.standard.setValue(username, forKey: "user")
    }
    
    static func setDefaultStartup(flag: Bool) {
        let defaults = UserDefaults.standard
        defaults.setValue(flag, forKey: "startup")
    }
    
    static func getDefaultStartup() -> Int {
        let defaults = UserDefaults.standard
        let startup = defaults.bool(forKey: "startup")
        if (startup) {
            return 1
        }
        return 0
    }
    
    static func formatDate() -> String {
        let currentDate = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let stringDate = dateFormatter.string(from: currentDate)
        return stringDate
    }
    
    static func todayIsNotifaction() -> Bool {
        let date = Utils.formatDate()
        let defaults = UserDefaults.standard
        return defaults.bool(forKey: date + Utils.getUser())
    }
    
    static func setTodayNotifaction(flag: Bool) {
        let date = Utils.formatDate()
        let defaults = UserDefaults.standard
        defaults.set(flag, forKey: date + Utils.getUser())
    }
}
