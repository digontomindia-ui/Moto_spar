import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';

import { responsiveWidth } from 'react-native-responsive-dimensions';
import { HomeContext } from '../../context/HomeContext';
import Colors from '../../constants/Colors';


const PrefrenceandIssueModal = ({ visible, setVisible, title }) => {
    const { ReportSubmit } = useContext(HomeContext);
    const [msg, setMsg] = useState('');

    const handle = async () => {
        if (!msg) {
            alert('Please enter a message');
            return;
        } else {
            var status = await ReportSubmit(
                msg,
                title === 'Report an Issue' ? 'report_issue' : 'app_preference',
            );
            if (status == "success") {
                setMsg('');
                setVisible(false);
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType='fade'
            onRequestClose={() => setVisible(false)}
        >
            <View style={styles.backdrop}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>{title}</Text>

                    <TextInput
                        style={styles.textArea}
                        multiline={true}
                        numberOfLines={5}
                        placeholder='Type your message here...'
                        placeholderTextColor='#999'
                        value={msg}
                        onChangeText={setMsg}
                        textAlignVertical='top'
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            onPress={() => setVisible(false)}
                            style={{
                                ...styles.button,
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderColor: '#555555',
                            }}
                        >
                            <Text style={{ ...styles.buttonText, color: '#555555' }}>
                                Close
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                handle();
                            }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: Colors.background?.primary,
        borderRadius: 20,
        padding: 30,
        width: '90%',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textColors.primary,
        marginBottom: 10,
    },
    textArea: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#555555',
        borderRadius: 7,
        padding: 12,
        fontSize: 16,
        color: Colors.textColors.primary,
        height: 100,
        textAlignVertical: 'top',
        marginTop: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginTop: 20,
    },
    button: {
        backgroundColor: Colors?.btnColors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    viewCon: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5,
        borderWidth: 1,
        width: '100%',
        borderColor: '#555555',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 5,
        justifyContent: 'space-between',
    },
    checkbox: {
        width: responsiveWidth(5.5),
        height: responsiveWidth(5.5),
        backgroundColor: Colors.background,
        borderRadius: responsiveWidth(0.5),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: responsiveWidth(0.7),
    },
});




export default PrefrenceandIssueModal