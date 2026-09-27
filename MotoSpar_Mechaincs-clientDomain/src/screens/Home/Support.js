import { View, Text, TouchableOpacity, Animated, useWindowDimensions, TextInput, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { styles } from '../../assets/Css/Notification_SupportCss'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import { FlatList } from 'react-native-gesture-handler';
import { Fonts, FontWeight } from '../../constants/Fonts';



const Support = () => {
    const { width: screenWidth } = useWindowDimensions();
    const navigation = useNavigation()
    const [activeTab, setActiveTab] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const tabs = ["Customer Support", "FAQ & Guidelines"];
    const handleTabPress = (index) => {
        setActiveTab(index);
        Animated.spring(translateX, {
            toValue: index * screenWidth / 2, // Adjust width based on tab size
            useNativeDriver: false,
        }).start();
    };
    const Customer_Support = () => {
        return (
            <View>
                <StatusBar barStyle={'dark-content'} />
                <View style={{ ...styles.CardTextflex, justifyContent: 'flex-start', gap: 10, marginBottom: 25 }}>
                    <Text style={styles.txt16bold}>Need Help? Contact us </Text>

                </View>

                <TouchableOpacity style={{ ...styles.CardTextflex, justifyContent: 'flex-start', gap: 10 }} activeOpacity={0.7}>
                    <IO
                        name='call-outline'
                        size={responsiveFontSize(3)}
                        color={Colors.btnColors.primary}
                    />
                    <Text style={styles.txt16}>Call Support</Text>
                </TouchableOpacity>
                <View style={{ ...styles.divider, marginVertical: 20 }} />

                <TouchableOpacity style={{ ...styles.CardTextflex, justifyContent: 'flex-start', gap: 10 }} activeOpacity={0.7}>
                    <IO
                        name='mail-outline'
                        size={responsiveFontSize(3)}
                        color={Colors.btnColors.primary}
                    />
                    <Text style={styles.txt16}>Contact via mail</Text>
                </TouchableOpacity>
                <View style={{ ...styles.divider, marginVertical: 20 }} />

            </View>
        )
    }
    const Faq = () => {

        const faqs = [
            {
                question: "How do I manage my notifications?",
                answer:
                    "To manage notifications, go to 'Settings,' select 'Notification Settings,' and customize your preferences.",
            },
            {
                question: "How do I view my wallet balance?",
                answer: "You can view your wallet by navigating to the 'Wallet' which is locted in bottom tabs section in the app.",
            },
            {
                question: "Is my data safe and private?",
                answer: "Yes, we take data security seriously. Your data is encrypted and protected with the latest security measures.",
            },
            {
                question: "How do I accpet a new job?",
                answer: "First navigate to Jobs section which is in bottom tabs.\nBy clicking on the new job you will see the accept and reject button you can choose among them and proceed woth you job.",
            },
        ];
        const [openIndex, setOpenIndex] = useState(null);
        const [search, setSearch] = useState('');
        const [searchedFaq, setSearchedFaq] = useState(faqs);

        useEffect(() => {
            console.log('jsn')
            const filtered = faqs.filter((item) =>
                item.question.toLowerCase().includes(search.toLowerCase())
            );
            setSearchedFaq(filtered);
        }, [search]);

        return (
            <View >


                <View style={styles.SearchContainer}>
                    <IO name="search-outline" size={20} color={Colors.background} style={styles.searchIcon} />
                    <TextInput
                        style={{
                            width: '90%',
                            height: 45,
                            paddingHorizontal: 10,
                            fontSize: Fonts.font14,
                            fontWeight: FontWeight.medium,


                        }}
                        autoCapitalize="none"
                        placeholder={'Search'}
                        cursorColor={'white'}
                        keyboardType={'default'}
                        returnKeyType="next"
                        underlineColorAndroid="transparent"
                        blurOnSubmit={false}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <FlatList
                    data={searchedFaq}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.faqContainer}>
                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }} onPress={() => setOpenIndex(openIndex === index ? null : index)}>
                                <Text style={styles.txt14bold}>{item.question}</Text>
                                {
                                    openIndex === index ?
                                        <IO name="chevron-up-outline" size={15} color={Colors.textColors.primary} /> :
                                        <IO name="chevron-down-outline" size={15} color={Colors.textColors.primary} />
                                }
                            </TouchableOpacity>
                            {openIndex === index && <Text style={{ ...styles.txt12, marginTop: 10 }}>{item.answer}</Text>}
                        </View>
                    )}
                />
                <View style={{ marginTop: 25 }}>
                    <Text style={styles.txt16bold}>Our Guidelines</Text>
                    <View style={{ ...styles.divider, marginTop: 5 }} />
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
                    style={{ marginBottom: 10 }}
                >
                    <Text style={styles.txt16}>Terms and Conditions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.txt16}>Earning & Payment Rules</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.subcontainer}>
                <View style={{ ...styles.CardTextflex, marginTop: 10 }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                    >
                        <IO
                            name='arrow-back-outline'
                            size={responsiveFontSize(3)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={{ ...styles.txt20bold }}>Support & Help</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.divider} />
                <View style={styles.tabContainer}>
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleTabPress(index)}
                            style={styles.tab}
                        >
                            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.indicatorWrapper}>
                    <Animated.View
                        style={[
                            styles.indicator,

                            {
                                width: '46%',
                                transform: [{ translateX }],
                            },
                        ]}
                    />
                </View>
                <View style={styles.subcontainer}>
                    {
                        tabs[activeTab] === "Customer Support" ?
                            <Customer_Support />
                            :
                            <Faq />
                    }
                </View>
            </View>
        </View>
    )
}



export default Support