//
//  WeakScriptMessageDelegate.swift
//  GithubStatus_3
//
//  Created by 张佳皓 on 2019/4/7.
//  Copyright © 2019 张佳皓. All rights reserved.
//
import WebKit
class WeakScriptMessageDelegate: NSObject, WKScriptMessageHandler {
    weak var scriptDelegate: WKScriptMessageHandler?
    init(_ scriptDelegate: WKScriptMessageHandler) {
        self.scriptDelegate = scriptDelegate
        super.init()
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        scriptDelegate?.userContentController(userContentController, didReceive: message)
    }
    deinit {
        print("WeakScriptMessageDelegate is deinit")
    }
}
