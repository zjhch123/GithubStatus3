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

class GithubWebViewController: NSViewController, WKNavigationDelegate, GithubRequestDelegate, WKScriptMessageHandler {
    
    @IBOutlet weak var webView: WKWebView!
    
    var githubRequest: GithubRequests!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.githubRequest = GithubRequests(delegate: self)
        let path = Bundle.main.path(forResource: "index", ofType: "html")
        let url = URL(fileURLWithPath:path!)
        let request = URLRequest(url:url)
        self.webView.configuration.userContentController = WKUserContentController()
        
        self.webView.configuration.userContentController.add(WeakScriptMessageDelegate(self), name: "setUser")
        self.webView.configuration.userContentController.add(WeakScriptMessageDelegate(self), name: "openURL")
        
        self.webView.load(request)
        self.webView.navigationDelegate = self
        
        self.githubRequest.request()
    }
    
    override func viewWillAppear() {
        self.githubRequest.request()
    }
    
    @IBAction func homeBtnClickHandler(_ sender: Any) {
        let user = Utils.getUser();
        self.openURL(url: "https://github.com/" + user)
    }
    
    @IBAction func refreshBtnClickHandler(_ sender: Any) {
        self.githubRequest.request()
    }
    
    @IBAction func exitButtonClickHandler(_ sender: Any) {
        NSApplication.shared.terminate(self)
    }
    
    @IBAction func settingsButtonClickHandler(_ sender: Any) {
        self.webView.evaluateJavaScript("window.EventEmitter.emit('setting')")
    }
    
    func openURL(url: String) {
        let opened: URL! = URL(string: url)
        NSWorkspace.shared.open(opened)
    }
    
    func requestDidFinished(username: String, html: String, count: String) {
        DispatchQueue.main.sync {
            let fixedParam = html.replacingOccurrences(of: "`", with: "")
            self.webView.evaluateJavaScript("window.EventEmitter.emit('render', `\(fixedParam)`)")
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        let name = message.name
        let body = message.body as! String
        switch name {
        case "setUser":
            Utils.setUser(username: body)
            self.githubRequest.request()
            break
        case "openURL":
            self.openURL(url: body)
            break
        default: break
        }
    }
}
