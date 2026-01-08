/**
 * Mina Rich Editor - Action Types
 *
 * Defines all possible actions that can be dispatched to modify the editor state.
 * Follows Redux-style action pattern for predictability and debugging.
 *
 * @packageDocumentation
 */
/**
 * Action creator helpers for type-safe action creation.
 */
export const EditorActions = {
    /**
     * Creates an UPDATE_NODE action.
     */
    updateNode: (id, updates) => ({
        type: 'UPDATE_NODE',
        payload: { id, updates },
    }),
    /**
     * Creates an UPDATE_ATTRIBUTES action.
     */
    updateAttributes: (id, attributes, merge = true) => ({
        type: 'UPDATE_ATTRIBUTES',
        payload: { id, attributes, merge },
    }),
    /**
     * Creates an UPDATE_CONTENT action.
     */
    updateContent: (id, content) => ({
        type: 'UPDATE_CONTENT',
        payload: { id, content },
    }),
    /**
     * Creates a DELETE_NODE action.
     */
    deleteNode: (id) => ({
        type: 'DELETE_NODE',
        payload: { id },
    }),
    /**
     * Creates an INSERT_NODE action.
     */
    insertNode: (node, targetId, position) => ({
        type: 'INSERT_NODE',
        payload: { node, targetId, position },
    }),
    /**
     * Creates a MOVE_NODE action.
     */
    moveNode: (nodeId, targetId, position) => ({
        type: 'MOVE_NODE',
        payload: { nodeId, targetId, position },
    }),
    /**
     * Creates a SWAP_NODES action.
     */
    swapNodes: (nodeId1, nodeId2) => ({
        type: 'SWAP_NODES',
        payload: { nodeId1, nodeId2 },
    }),
    /**
     * Creates a DUPLICATE_NODE action.
     */
    duplicateNode: (id, newId) => ({
        type: 'DUPLICATE_NODE',
        payload: { id, newId },
    }),
    /**
     * Creates a REPLACE_CONTAINER action.
     */
    replaceContainer: (container) => ({
        type: 'REPLACE_CONTAINER',
        payload: { container },
    }),
    /**
     * Creates a RESET action.
     */
    reset: () => ({
        type: 'RESET',
    }),
    /**
     * Creates a SET_STATE action.
     */
    setState: (state) => ({
        type: 'SET_STATE',
        payload: { state },
    }),
    /**
     * Creates a BATCH action.
     */
    batch: (actions) => ({
        type: 'BATCH',
        payload: { actions },
    }),
    /**
     * Creates a SET_ACTIVE_NODE action.
     */
    setActiveNode: (nodeId) => ({
        type: 'SET_ACTIVE_NODE',
        payload: { nodeId },
    }),
    /**
     * Creates a SET_SELECTION action.
     */
    setSelection: (hasSelection) => ({
        type: 'SET_SELECTION',
        payload: { hasSelection },
    }),
    /**
     * Creates an INCREMENT_SELECTION_KEY action.
     */
    incrementSelectionKey: () => ({
        type: 'INCREMENT_SELECTION_KEY',
    }),
    /**
     * Creates a SET_CURRENT_SELECTION action.
     */
    setCurrentSelection: (selection) => ({
        type: 'SET_CURRENT_SELECTION',
        payload: { selection },
    }),
    /**
     * Creates a TOGGLE_FORMAT action.
     */
    toggleFormat: (format) => ({
        type: 'TOGGLE_FORMAT',
        payload: { format },
    }),
    /**
     * Creates an APPLY_INLINE_ELEMENT_TYPE action.
     * Note: 'code' is excluded - use toggleFormat('code') for inline code formatting
     */
    applyInlineElementType: (elementType) => ({
        type: 'APPLY_INLINE_ELEMENT_TYPE',
        payload: { elementType },
    }),
    /**
     * Creates an APPLY_CUSTOM_CLASS action.
     */
    applyCustomClass: (className) => ({
        type: 'APPLY_CUSTOM_CLASS',
        payload: { className },
    }),
    /**
     * Creates an APPLY_INLINE_STYLE action.
     */
    applyInlineStyle: (property, value) => ({
        type: 'APPLY_INLINE_STYLE',
        payload: { property, value },
    }),
    /**
     * Creates an APPLY_LINK action.
     */
    applyLink: (href) => ({
        type: 'APPLY_LINK',
        payload: { href },
    }),
    /**
     * Creates a REMOVE_LINK action.
     */
    removeLink: () => ({
        type: 'REMOVE_LINK',
    }),
    /**
     * Creates a SELECT_ALL_BLOCKS action.
     */
    selectAllBlocks: () => ({
        type: 'SELECT_ALL_BLOCKS',
    }),
    /**
     * Creates a CLEAR_BLOCK_SELECTION action.
     */
    clearBlockSelection: () => ({
        type: 'CLEAR_BLOCK_SELECTION',
    }),
    /**
     * Creates a DELETE_SELECTED_BLOCKS action.
     */
    deleteSelectedBlocks: () => ({
        type: 'DELETE_SELECTED_BLOCKS',
    }),
    /**
     * Creates an UNDO action.
     */
    undo: () => ({
        type: 'UNDO',
    }),
    /**
     * Creates a REDO action.
     */
    redo: () => ({
        type: 'REDO',
    }),
    /**
     * Creates a SET_COVER_IMAGE action.
     */
    setCoverImage: (coverImage) => ({
        type: 'SET_COVER_IMAGE',
        payload: { coverImage },
    }),
    /**
     * Creates a REMOVE_COVER_IMAGE action.
     */
    removeCoverImage: () => ({
        type: 'REMOVE_COVER_IMAGE',
    }),
    /**
     * Creates an UPDATE_COVER_IMAGE_POSITION action.
     */
    updateCoverImagePosition: (position) => ({
        type: 'UPDATE_COVER_IMAGE_POSITION',
        payload: { position },
    }),
};
