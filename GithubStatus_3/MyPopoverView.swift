//
//  MyPopoverView.swift
//  GithubStatus_3
//
//  Created by 张佳皓 on 2018/8/5.
//  Copyright © 2018年 张佳皓. All rights reserved.
//

import Cocoa

class MyPopoverView: NSView {

    override func viewDidMoveToWindow() {
        var backgroundView:PopoverBackgroundView?
        
        super.viewDidMoveToWindow()
        if let frameView = self.window?.contentView?.superview {
            if backgroundView == nil {
                backgroundView = PopoverBackgroundView(frame: frameView.bounds)
                backgroundView!.autoresizingMask = NSView.AutoresizingMask([.width, .height]);
                frameView.addSubview(backgroundView!, positioned: NSWindow.OrderingMode.below, relativeTo: frameView)
            }
        }
    }
    
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
    }
    
}

class PopoverBackgroundView:NSView {
    override func draw(_ dirtyRect: NSRect) {
        NSColor.init(red: 245/255, green: 245/255, blue: 245/255, alpha: 1).set()
        self.bounds.fill()
    }
}
