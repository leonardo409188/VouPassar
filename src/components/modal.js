import React from 'react'
import Dialog from "react-native-dialog"
import { StyleSheet, View } from 'react-native'
import { Button,Text } from 'native-base';

const Modal = ({
    messageModal,
    labelButton,
    isVisible,
    onPress
}) => ( <Dialog.Container visible={isVisible}>
                <View style={styles.modal}>
                    <Dialog.Description>
                        {messageModal}
                    </Dialog.Description>
                </View>
                <View style={styles.buttonView}>
                    <Button onPress={onPress} small style={styles.button}>
                        <Text>
                            {labelButton}
                        </Text>
                    </Button>
                </View>
        </Dialog.Container> )

const styles = StyleSheet.create({ 
    modal: {
        alignItems: 'center', 
        marginTop: -25
    },

    buttonView: {
        alignItems: 'center', 
        marginTop: 30, 
        flexDirection: 'row', 
        alignContent: 'center', 
        justifyContent: 'center'
    },

    button: {
        backgroundColor: 'steelblue', 
        marginLeft: 20
    }
})

export { Modal };