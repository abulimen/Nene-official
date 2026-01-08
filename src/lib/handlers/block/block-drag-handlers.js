/**
 * Block Drag Handler Functions
 *
 * Functions for handling drag operations in Block components
 */
/**
 * Create handle block drag start
 */
export function createHandleBlockDragStart(textNode, onBlockDragStart) {
    return (e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", textNode.id);
        e.dataTransfer.setData("application/json", JSON.stringify({
            nodeId: textNode.id,
            type: textNode.type,
        }));
        if (onBlockDragStart) {
            onBlockDragStart(textNode.id);
        }
    };
}
/**
 * Create handle block drag end
 */
export function createHandleBlockDragEnd(onDragEnd) {
    return (e) => {
        e.stopPropagation();
        // Clear dragging state
        if (onDragEnd) {
            onDragEnd();
        }
    };
}
