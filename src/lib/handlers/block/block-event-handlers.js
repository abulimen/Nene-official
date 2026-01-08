/**
 * Block Event Handler Functions
 *
 * Functions for handling events in Block components
 */
import { findParentById } from "../../utils/tree-operations";
/**
 * Create handle composition start
 */
export function createHandleCompositionStart() {
    return (isComposingRef) => {
        return () => {
            isComposingRef.current = true;
        };
    };
}
/**
 * Create handle composition end
 */
export function createHandleCompositionEnd() {
    return (isComposingRef) => {
        return () => {
            isComposingRef.current = false;
        };
    };
}
/**
 * Create handle input
 */
export function createHandleInput(params) {
    return (e) => {
        const { textNode, readOnly, onInput, onChangeBlockType, showCommandMenu, setShowCommandMenu, setCommandMenuAnchor, shouldPreserveSelectionRef } = params;
        const element = e.currentTarget;
        const text = element.textContent || "";
        // DEBUG: Log what user is typing
        if (process.env.NODE_ENV === 'development') {
            console.log(`📝 [INPUT] Block ${textNode.id}:`, {
                text,
                innerHTML: element.innerHTML,
                currentNodeContent: textNode.content,
            });
        }
        // Check if this is a header block (h1) - headers don't show command menu
        const isHeaderBlock = textNode.type === 'h1';
        // Check if the block is empty and user typed "/" (but not for header blocks)
        if (text === "/" && !readOnly && onChangeBlockType && !isHeaderBlock) {
            setShowCommandMenu(true);
            setCommandMenuAnchor(element);
        }
        else if (showCommandMenu && text !== "/") {
            // Close menu if user continues typing
            setShowCommandMenu(false);
        }
        // Set flag to prevent content updates until next render
        shouldPreserveSelectionRef.current = true;
        // Call the parent onInput handler
        onInput(element);
        // Reset the flag quickly to allow Block component to sync with state
        // Reduced from 200ms since we're no longer debouncing state updates
        setTimeout(() => {
            shouldPreserveSelectionRef.current = false;
        }, 50);
    };
}
/**
 * Create handle key down
 */
export function createHandleKeyDown(params) {
    return (e) => {
        const { textNode, onKeyDown, onCreateNested, showCommandMenu, setShowCommandMenu, setCommandMenuAnchor, currentContainer, dispatch, } = params;
        // DEBUG: Log key presses
        if (process.env.NODE_ENV === 'development' && e.key === 'Enter') {
            const element = e.currentTarget;
            console.log(`⏎ [ENTER] Block ${textNode.id}:`, {
                key: e.key,
                shiftKey: e.shiftKey,
                textContent: element.textContent,
                innerHTML: element.innerHTML,
                currentNodeContent: textNode.content,
                nodeType: textNode.type,
            });
        }
        // Close command menu on Escape
        if (e.key === "Escape" && showCommandMenu) {
            e.preventDefault();
            setShowCommandMenu(false);
            setCommandMenuAnchor(null);
            return;
        }
        // If command menu is open, let it handle the keyboard events
        if (showCommandMenu &&
            ["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
            // Don't prevent default - let CommandMenu handle it
            return;
        }
        // For list items (ol/li), handle Enter and Shift+Enter specially
        // For non-list items, Shift+Enter creates nested blocks
        const isListItem = textNode.type === "ol" ||
            textNode.type === "li";
        // Handle Shift+Enter for list items - add line break within item
        if (e.key === "Enter" && e.shiftKey && isListItem) {
            e.preventDefault();
            e.stopPropagation();
            // Pass to SimpleEditor to handle line break insertion
            onKeyDown(e);
            return;
        }
        // Handle Shift+Enter for non-list items - create nested block
        if (e.key === "Enter" && e.shiftKey && !isListItem && onCreateNested) {
            e.preventDefault();
            onCreateNested(textNode.id);
            return;
        }
        // Handle regular Enter for list items - create new list item at same level
        if (e.key === "Enter" && !e.shiftKey && isListItem) {
            e.preventDefault();
            e.stopPropagation();
            // Get current container (call it if it's a getter function)
            const container = typeof currentContainer === 'function' ? currentContainer() : currentContainer;
            // Find the parent container
            const parent = findParentById(container, textNode.id);
            if (parent) {
                // Create a new list item with the same type
                const newListItem = {
                    id: `li-${Date.now()}`,
                    type: textNode.type, // Keep the same type (ul/ol/li)
                    content: "",
                };
                // Insert after the current list item
                dispatch({
                    type: "INSERT_NODE",
                    payload: {
                        node: newListItem,
                        targetId: textNode.id,
                        position: "after",
                    },
                });
                // Focus the new list item after a short delay
                setTimeout(() => {
                    const newElement = document.querySelector(`[data-node-id="${newListItem.id}"]`);
                    if (newElement) {
                        newElement.focus();
                    }
                }, 0);
            }
            else {
                console.warn("🔷 [Block.tsx] Could not find parent container for list item");
            }
            return;
        }
        // Pass to parent handler for other keys
        onKeyDown(e);
    };
}
/**
 * Create handle click
 */
export function createHandleClick(params) {
    return (e) => {
        const { readOnly, onClick } = params;
        // Check if the click target is a link
        const target = e.target;
        if (target.tagName === "A" && target.hasAttribute("href")) {
            // In read-only mode, let links work naturally
            if (readOnly) {
                return; // Let the browser handle the link
            }
            else {
                // In edit mode, prevent link navigation
                e.preventDefault();
            }
        }
        // Call the parent onClick handler
        onClick();
    };
}
/**
 * Create handle command select
 */
export function createHandleCommandSelect(params) {
    return (commandValue) => {
        const { textNode, onChangeBlockType, onInsertImage, onCreateList, onCreateTable, localRef, setShowCommandMenu, setCommandMenuAnchor, } = params;
        if (!localRef.current)
            return;
        // Clear the "/" character
        localRef.current.textContent = "";
        // Close the menu immediately
        setShowCommandMenu(false);
        setCommandMenuAnchor(null);
        // Handle image insertion specially
        if (commandValue === "img" && onInsertImage) {
            onInsertImage(textNode.id);
            return;
        }
        // Handle list creation (both ordered and unordered) - create a container with multiple list items
        if ((commandValue === "ol" || commandValue === "ul") && onCreateList) {
            // Small delay to ensure menu is closed before creating the list
            setTimeout(() => {
                onCreateList(textNode.id, commandValue);
            }, 50);
            return;
        }
        // Handle table creation
        if (commandValue === "table" && onCreateTable) {
            // Small delay to ensure menu is closed before opening table dialog
            setTimeout(() => {
                onCreateTable(textNode.id);
            }, 50);
            return;
        }
        // For other block types (including 'li'), just change the type
        if (onChangeBlockType) {
            onChangeBlockType(textNode.id, commandValue);
            // Focus back on the block
            setTimeout(() => {
                localRef.current?.focus();
            }, 0);
        }
    };
}
/**
 * Create handle background color change
 */
export function createHandleBackgroundColorChange(textNode, dispatch) {
    return (color) => {
        dispatch({
            type: "UPDATE_ATTRIBUTES",
            payload: {
                id: textNode.id,
                attributes: {
                    backgroundColor: color,
                },
                merge: true,
            },
        });
    };
}
