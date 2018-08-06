//
//  GithubRequests.swift
//  GithubStatus_3
//
//  Created by 张佳皓 on 2018/8/6.
//  Copyright © 2018年 张佳皓. All rights reserved.
//

import Foundation
import SwiftHTTP
import Regex


protocol GithubRequestDelegate {
    func requestDidFinished(username: String, html: String, count: String)
}

class GithubRequests {
    var delegate: GithubRequestDelegate?
    
    init(delegate: GithubRequestDelegate) {
        self.delegate = delegate
    }
    
    func getCountFrom(html: String) -> String? {
        let currentDate = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale.current
        dateFormatter.dateFormat = "YYYY-MM-dd"
        let stringDate = dateFormatter.string(from: currentDate)
        let pattern = "fill=\"(#\\w{6})\" data-count=\"(\\d{1,})\" data-date=\"\(stringDate)\""
        let digit = pattern.r?.findFirst(in: html)?.group(at: 2)
        return digit
    }
    
    func getCountFrom(html: String, username: String) {
        let digit = getCountFrom(html: html)
        self.delegate?.requestDidFinished(username: username, html: html, count: digit!)
    }
    
    func request() {
        let username = Utils.getUser()
        let headers = [
            "Host": "github.com",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, sdch, br",
            "Cookie": "tz=Asia/Shanghai"
        ]
        HTTP.GET("https://github.com/" + username, headers: headers) { response in
            if let err = response.error {
                print("error: \(err.localizedDescription)")
                return
            }
            self.getCountFrom(html: response.text!, username: username)
        }
    }
}


