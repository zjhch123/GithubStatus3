//
//  GithubWebViewController.swift
//  GithubStatus_3
//
//  Created by 张佳皓 on 2018/8/5.
//  Copyright © 2018年 张佳皓. All rights reserved.
//

import Cocoa
import ServiceManagement
import WebKit
import SwiftHTTP

class GithubWebViewController: NSViewController, WKNavigationDelegate, GithubRequestDelegate {
    
    @IBOutlet weak var webView: WKWebView!
    @IBOutlet var settingsWindow: NSWindow!
    @IBOutlet weak var defaultUserSettingInput: NSTextField!
    @IBOutlet weak var defaultStartUpSettingInput: NSButton!
    @IBOutlet weak var settingsButton: NSButton!
    
    var githubRequest: GithubRequests!
    
    let settingsPopover = NSPopover()
    
    func startupAppWhenLogin() {
        let launcherAppIdentifier = "xyz.hduzplus.MainAppHelper"
        
        SMLoginItemSetEnabled(launcherAppIdentifier as CFString, Utils.getDefaultStartup() == 1)
        
        var startedAtLogin = false
        for app in NSWorkspace.shared.runningApplications {
            if app.bundleIdentifier == launcherAppIdentifier {
                startedAtLogin = true
            }
        }
        
        if startedAtLogin {
            DistributedNotificationCenter.default.post(name: NSNotification.Name(rawValue: "killhelper"), object: Bundle.main.bundleIdentifier!)
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.githubRequest = GithubRequests(delegate: self)
        let path = Bundle.main.path(forResource: "index", ofType: "html")
        let url = URL(fileURLWithPath:path!)
        let request = URLRequest(url:url)
        self.webView.load(request)
        self.webView.navigationDelegate = self
        self.githubRequest.request()
    }
    
    override func viewWillAppear() {
        self.githubRequest.request()
    }
    
    @IBAction func homeBtnClickHandler(_ sender: Any) {
        let user = Utils.getUser();
        if let url = URL(string: "https://github.com/" + user), NSWorkspace.shared.open(url) {
            // TODO
        }
    }
    @IBAction func refreshBtnClickHandler(_ sender: Any) {
        self.githubRequest.request()
    }
    @IBAction func exitButtonClickHandler(_ sender: Any) {
        NSApplication.shared.terminate(self)
    }
    @IBAction func settingsButtonClickHandler(_ sender: Any) {
        settingsWindow.orderFront(nil)
        settingsWindow.makeKeyAndOrderFront(nil)
        defaultUserSettingInput.stringValue = Utils.getUser()
        defaultStartUpSettingInput.state = NSControl.StateValue.init(Utils.getDefaultStartup())
    }
    
    @IBAction func settingSuccessButtonClickHandler(_ sender: Any) {
        let newUser = defaultUserSettingInput.stringValue
        let newStartup = defaultStartUpSettingInput.state.rawValue == 1
        Utils.setUser(username: newUser)
        Utils.setDefaultStartup(flag: newStartup)
        self.githubRequest.request()
        self.startupAppWhenLogin()
        self.settingsWindow.performClose(nil)
    }
    
    func requestDidFinished(username: String, html: String, count: String) {
        DispatchQueue.main.sync {
            self.doScript(param: html)
        }
    }
    
    func doScript(param: String) {
        let fixedParam = param.replacingOccurrences(of: "`", with: "")
        self.webView.evaluateJavaScript("window.EventEmitter.emit('getData', `\(fixedParam)`)")
    }

}
