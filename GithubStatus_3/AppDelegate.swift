//
//  AppDelegate.swift
//  GithubStatus_3
//
//  Created by 张佳皓 on 2018/8/5.
//  Copyright © 2018年 张佳皓. All rights reserved.
//

import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

    @IBOutlet weak var window: NSWindow!
    
    var eventMonitor: EventMonitor?

    let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
    let popover = NSPopover()
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        eventMonitor = EventMonitor(mask: [.leftMouseDown, .rightMouseDown]) { [weak self] event in
            if let strongSelf = self, strongSelf.popover.isShown {
                strongSelf.closePopover(sender: event!)
            }
        }
        if let button = statusItem.button {
            button.image = NSImage(named: NSImage.Name(rawValue: "logo"))
            button.action = #selector(AppDelegate.togglePopover(sender:))
        }
        popover.contentViewController = GithubWebViewController(nibName: NSNib.Name(rawValue: "GithubWebViewController"), bundle: nil)
    }

    func showPopover(sender: AnyObject?) {
        if let button = statusItem.button {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)
        }
        eventMonitor?.start()
    }
    
    func closePopover(sender: AnyObject?) {
        popover.performClose(sender)
        eventMonitor?.stop()
    }
    
    @objc func togglePopover(sender: AnyObject?) {
        if popover.isShown {
            closePopover(sender: sender)
        } else {
            showPopover(sender: sender)
        }
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
    }


}

