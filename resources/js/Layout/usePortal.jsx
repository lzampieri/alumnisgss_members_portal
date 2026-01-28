// Copied from https://github.com/iamthesiz/react-useportal, but slightly modified to be compatible with react 18

import { useState, useRef, useEffect, useCallback, useMemo, ReactNode, DOMAttributes, SyntheticEvent, MutableRefObject, MouseEvent } from 'react'
import { createPortal } from 'react-dom'


export const errorMessage1 = 'You must either add a `ref` to the element you are interacting with or pass an `event` to openPortal(e) or togglePortal(e) when the `programmaticallyOpen` option is not set to `true`.'

export default function usePortal({
    closeOnOutsideClick = true,
    closeOnEsc = true,
    bindTo, // attach the portal to this node in the DOM
    isOpen: defaultIsOpen = false,
    onOpen,
    onClose,
    onPortalClick,
    programmaticallyOpen = false,
    ...eventHandlers
}) {
    const [isOpen, makeOpen] = useState(defaultIsOpen)
    // we use this ref because `isOpen` is stale for handleOutsideMouseClick
    const open = useRef(isOpen)

    const setOpen = useCallback((v) => {
        // workaround to not have stale `isOpen` in the handleOutsideMouseClick
        open.current = v
        makeOpen(v)
    }, [])

    const targetEl = useRef() // this is the element you are clicking/hovering/whatever, to trigger opening the portal
    const portal = useRef(document.createElement('div'))

    useEffect(() => {
        if (!portal.current) portal.current = document.createElement('div')
    }, [portal])

    const elToMountTo = useMemo(() => {
        return document.body
    }, [bindTo])

    const createCustomEvent = (e) => {
        if (!e) return { portal, targetEl, event: e }
        const event = e || {}
        if (event.persist) event.persist()
        event.portal = portal
        event.targetEl = targetEl
        event.event = e
        const { currentTarget } = e
        if (!targetEl.current && currentTarget && currentTarget !== document) targetEl.current = event.currentTarget
        return event
    }

    // this should handle all eventHandlers like onClick, onMouseOver, etc. passed into the config
    const customEventHandlers = Object
        .entries(eventHandlers)
        .reduce((acc, [handlerName, eventHandler]) => {
            acc[handlerName] = (event) => {
                eventHandler(createCustomEvent(event))
            }
            return acc
        }, {})

    const openPortal = useCallback((e) => {
        const customEvent = createCustomEvent(e)
        // for some reason, when we don't have the event argument, there
        // is a weird race condition. Would like to see if we can remove
        // setTimeout, but for now this works
        if (targetEl.current == null && !programmaticallyOpen) {
            setTimeout(() => setOpen(true), 0)
            throw Error(errorMessage1)
        }
        if (onOpen) onOpen(customEvent)
        setOpen(true)
    }, [portal, setOpen, targetEl, onOpen])

    const closePortal = useCallback((e) => {
        const customEvent = createCustomEvent(e)
        if (onClose && open.current) onClose(customEvent)
        if (open.current) setOpen(false)
    }, [onClose, setOpen])

    const togglePortal = useCallback((e) =>
        open.current ? closePortal(e) : openPortal(e),
        [closePortal, openPortal]
    )

    const handleKeydown = useCallback((e) =>
        (e.key === 'Escape' && closeOnEsc) ? closePortal(e) : undefined,
        [closeOnEsc, closePortal]
    )

    const handleOutsideMouseClick = useCallback((e) => {
        const containsTarget = (target) => target.current.contains(e.target)
        // There might not be a targetEl if the portal was opened programmatically.
        if (containsTarget(portal) || (e).button !== 0 || !open.current || (targetEl.current && containsTarget(targetEl))) return
        if (closeOnOutsideClick) closePortal(e)
    }, [closePortal, closeOnOutsideClick, portal])

    const handleMouseDown = useCallback((e) => {
        if (!(portal.current instanceof HTMLElement)) return
        const customEvent = createCustomEvent(e)
        if (portal.current.contains(customEvent.target) && onPortalClick) onPortalClick(customEvent)
        handleOutsideMouseClick(e)
    }, [handleOutsideMouseClick])

    // used to remove the event listeners on unmount
    const eventListeners = useRef({})

    useEffect(() => {
        if (!(elToMountTo instanceof HTMLElement) || !(portal.current instanceof HTMLElement)) return

        // TODO: eventually will need to figure out a better solution for this.
        // Surely we can find a way to map onScroll/onWheel -> scroll/wheel better,
        // but for all other event handlers. For now this works.
        const eventHandlerMap = {
            onScroll: 'scroll',
            onWheel: 'wheel',
        }
        const node = portal.current
        elToMountTo.appendChild(portal.current)
        // handles all special case handlers. Currently only onScroll and onWheel
        Object.entries(eventHandlerMap).forEach(([handlerName /* onScroll */, eventListenerName /* scroll */]) => {
            if (!eventHandlers[handlerName]) return
            eventListeners.current[handlerName] = (e) => (eventHandlers[handlerName])(createCustomEvent(e))
            document.addEventListener(eventListenerName, eventListeners.current[handlerName])
        })
        document.addEventListener('keydown', handleKeydown)
        document.addEventListener('mousedown', handleMouseDown)

        return () => {
            // handles all special case handlers. Currently only onScroll and onWheel
            Object.entries(eventHandlerMap).forEach(([handlerName, eventListenerName]) => {
                if (!eventHandlers[handlerName]) return
                document.removeEventListener(eventListenerName, eventListeners.current[handlerName])
                delete eventListeners.current[handlerName]
            })
            document.removeEventListener('keydown', handleKeydown)
            document.removeEventListener('mousedown', handleMouseDown)
            elToMountTo.removeChild(node)
        }
    }, [handleOutsideMouseClick, handleKeydown, elToMountTo, portal])

    const Portal = useCallback(({ children }) => {
        if (portal.current != null) return createPortal(children, portal.current)
        return null
    }, [portal])

    return Object.assign(
        [openPortal, closePortal, open.current, Portal, togglePortal, targetEl, portal],
        {
            isOpen: open.current,
            openPortal,
            ref: targetEl,
            closePortal,
            togglePortal,
            Portal,
            portalRef: portal,
            ...customEventHandlers,
            bind: { // used if you want to spread all html attributes onto the target element
                ref: targetEl,
                ...customEventHandlers
            }
        }
    )
}