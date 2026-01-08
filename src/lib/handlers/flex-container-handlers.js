/**
 * Flex Container Drag-and-Drop Handlers
 *
 * Handles drag and drop operations for flex containers
 */
import { EditorActions } from '../reducer/actions';
import { isTextNode } from '../types';
import { findNodeAnywhere } from '../utils/editor-helpers';
/**
 * Handle drag over on flex container edges
 */
export function createHandleFlexContainerDragOver(params) {
    return (e, flexContainerId, position) => {
        const { container, draggingNodeId, setDragOverFlexId, setFlexDropPosition } = params;
        e.preventDefault();
        e.stopPropagation();
        // Check if we're dragging something
        const draggedNodeId = e.dataTransfer.getData("text/plain");
        if (!draggedNodeId && !draggingNodeId) {
            return;
        }
        const actualDraggingId = draggingNodeId || draggedNodeId;
        // Find the dragging node
        const draggingResult = actualDraggingId ? findNodeAnywhere(actualDraggingId, container) : null;
        if (!draggingResult || !isTextNode(draggingResult.node)) {
            // Not a valid node to drag
            setDragOverFlexId(null);
            setFlexDropPosition(null);
            return;
        }
        const draggingNode = draggingResult.node;
        // Only allow image nodes
        if (draggingNode.type !== 'img') {
            setDragOverFlexId(null);
            setFlexDropPosition(null);
            return;
        }
        // Check if we're in the edge zones
        if (position) {
            setDragOverFlexId(flexContainerId);
            setFlexDropPosition(position);
            e.dataTransfer.dropEffect = "move";
        }
        else {
            setDragOverFlexId(null);
            setFlexDropPosition(null);
        }
    };
}
/**
 * Handle drag leave on flex container
 */
export function createHandleFlexContainerDragLeave(setDragOverFlexId, setFlexDropPosition) {
    return (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverFlexId(null);
        setFlexDropPosition(null);
    };
}
/**
 * Handle drop on flex container edges
 */
export function createHandleFlexContainerDrop(params) {
    return (e, flexContainerId, position) => {
        const { container, dispatch, toast, draggingNodeId, setDragOverFlexId, setFlexDropPosition, } = params;
        e.preventDefault();
        e.stopPropagation();
        if (!position || !draggingNodeId) {
            setDragOverFlexId(null);
            setFlexDropPosition(null);
            return;
        }
        // Find the dragging node and the flex container
        const draggingResult = findNodeAnywhere(draggingNodeId, container);
        const flexResult = findNodeAnywhere(flexContainerId, container);
        if (!draggingResult || !flexResult) {
            setDragOverFlexId(null);
            setFlexDropPosition(null);
            return;
        }
        const draggingNode = draggingResult.node;
        const flexContainer = flexResult.node;
        // Only handle image nodes
        if (draggingNode.type !== 'img') {
            setDragOverFlexId(null);
            setFlexDropPosition(null);
            return;
        }
        // Check if the dragging node is already in this flex container
        const isInSameContainer = draggingResult.parentId === flexContainerId;
        if (isInSameContainer) {
            // Case 1: Reordering within the same flex container
            const currentIndex = flexContainer.children.findIndex(c => c.id === draggingNodeId);
            const newChildren = [...flexContainer.children];
            // Remove from current position
            const [movedNode] = newChildren.splice(currentIndex, 1);
            // Insert at new position
            if (position === "left") {
                newChildren.unshift(movedNode);
            }
            else {
                newChildren.push(movedNode);
            }
            dispatch(EditorActions.updateNode(flexContainerId, {
                children: newChildren,
            }));
            toast({
                title: "Image repositioned!",
                description: "Image moved within the flex container",
            });
        }
        else {
            // Case 2: Adding image from outside to the flex container
            const newChildren = [...flexContainer.children];
            if (position === "left") {
                newChildren.unshift(draggingNode);
            }
            else {
                newChildren.push(draggingNode);
            }
            // Batch: delete from old location and update container
            const actions = [
                EditorActions.deleteNode(draggingNodeId),
                EditorActions.updateNode(flexContainerId, {
                    children: newChildren,
                }),
            ];
            dispatch(EditorActions.batch(actions));
            toast({
                title: "Image added!",
                description: "Image added to the flex container",
            });
        }
        setDragOverFlexId(null);
        setFlexDropPosition(null);
    };
}
