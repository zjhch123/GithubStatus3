//
//  EventMonitor.swift
//  GithubStatus_3
//
//  Created by 张佳皓 on 2018/8/6.
//  Copyright © 2018年 张佳皓. All rights reserved.
//

import Foundation

import Cocoa

class EventMonitor {
    var mask: NSEvent.EventTypeMask
    var handler : (NSEvent?) -> ()
    var monitor: Any?
    
    init(mask: NSEvent.EventTypeMask, handler: @escaping (NSEvent?) -> ()){
        self.mask = mask
        self.handler = handler
    }
    
    deinit {
        stop()
    }
    
    func start(){
        monitor = NSEvent.addGlobalMonitorForEvents(matching: mask, handler: handler)
    }
    
    func stop() {
        if monitor != nil {
            NSEvent.removeMonitor(monitor!)
            monitor = nil
        }
    }
    
}
