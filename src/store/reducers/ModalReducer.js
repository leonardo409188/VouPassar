import * as types from '../actions/action-types';

const INITIAL_STATE = {
    visible: false,
    messageModal: null,
    labelButton: null
}

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case types.SHOW_MODAL:
            return { visible: true, message: action.messageModal, labelButton: action.labelButton };
        case types.DIMISS_MODAL:    
            return { ...state, visible: false };
        default:
            return state;        
    }
}