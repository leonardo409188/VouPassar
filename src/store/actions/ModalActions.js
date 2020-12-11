import * as types from './action-types'

export const showModal = (messageModal, labelButton) => (dispatch) => {
    dispatch({
        type: types.SHOW_MODAL,
        messageModal,
        labelButton
    })
}