import { View, Text, TouchableOpacity, Image, Share, Alert, TextInput, FlatList, ActivityIndicator, Modal } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import IO from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions'
import { useNavigation } from '@react-navigation/native'
import { styles } from '../../../assets/Css/WalletCss';
import Colors from '../../../constants/Colors';
import { HomeContext } from '../../../context/HomeContext';


const Transaction = () => {

    const navigation = useNavigation()
    const { loadingactivity, GetJobs, mechanic_Jobs, setmechanic_Jobs, HasNext } = useContext(HomeContext);
    const [offset, setOffset] = useState(0);
    const [search, setsearch] = useState('');
    const [filteredData, setFilteredData] = useState(mechanic_Jobs);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [sortOrder, setSortOrder] = useState(null); // 'asc' | 'desc' | null
    useEffect(() => {
        setmechanic_Jobs([]); // Clear previous state
        setOffset(0);
        GetJobs(0)

    }, [])
    const loadMoreData = () => {
        if (HasNext && !loadingactivity) {
            const newOffset = offset + 10; // Assuming 10 items per page
            setOffset(newOffset);
            GetJobs(newOffset);
        }
    };
    const handleFilterSearch = (searchTextValue, sortType) => {
        let data = [...mechanic_Jobs];

        // Search
        if (searchTextValue) {
            data = data.filter((item) =>
                item?.order_details?.customer_details?.full_name
                    ?.toLowerCase()
                    .includes(searchTextValue.toLowerCase())
            );
        }

        // Sort
        if (sortType === 'asc') {
            data.sort((a, b) => a?.mechanic_fees - b?.mechanic_fees);
        } else if (sortType === 'desc') {
            data.sort((a, b) => b?.mechanic_fees - a?.mechanic_fees);
        }

        setFilteredData(data);
    };
    return (
        <View style={[styles.container, { flex: 1 }]}>
            {/* Main content area */}

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
                        <Text style={{ ...styles.txt20bold }}>Transaction History</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ ...styles.divider, marginVertical: 20 }} />
                {mechanic_Jobs && mechanic_Jobs?.length > 0
                    ?
                    <>
                        <View style={{ ...styles.card, borderColor: Colors.background.secondary }}>
                            <View style={[styles.CardTextflex, { alignItems: 'center' }]}>
                                <IO
                                    name="search-outline"
                                    size={responsiveFontSize(3)}
                                    color={Colors.btnColors.primary}
                                    style={{ marginRight: 6 }}
                                />
                                <TextInput
                                    placeholder="Search by name"
                                    placeholderTextColor="#888"
                                    style={{
                                        flex: 1,
                                        height: 20,
                                        fontSize: 16,
                                        color: '#000',
                                        paddingVertical: 0,
                                    }}
                                    value={search}
                                    onChangeText={(text) => {
                                        setsearch(text);
                                        handleFilterSearch(text, sortOrder);
                                    }}
                                    underlineColorAndroid="transparent"
                                />
                            </View>

                        </View>
                        <View style={{ ...styles.CardTextflex, marginVertical: 20 }}>

                            <TouchableOpacity style={{ ...styles.miniCard, backgroundColor: Colors.background.secondary }} activeOpacity={0.7} onPress={() => setShowFilterModal(true)}>
                                <View style={styles.CardTextflex}>
                                    <Text style={styles.txt12}>
                                        Filter
                                    </Text>
                                    <IO
                                        name="filter-outline"
                                        size={responsiveFontSize(2)}
                                        color={Colors.textColors.primary}
                                        style={{ marginRight: 6 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                        {/* Transaction card */}
                        <FlatList

                            showsVerticalScrollIndicator={false}
                            data={filteredData}
                            keyExtractor={(item) => item.id.toString()} // Unique key for each item
                            renderItem={({ item }) => (
                                <View style={{ ...styles.card, borderColor: Colors.background.secondary, marginTop: 15 }}>
                                    <View style={styles.CardTextflex}>
                                        <View>
                                            <View style={styles.CardTextflex}>
                                                <View
                                                    style={{
                                                        marginHorizontal: 10,
                                                        width: responsiveWidth(10),
                                                        height: responsiveWidth(10),
                                                        borderRadius: responsiveWidth(5),
                                                        backgroundColor: Colors?.btnColors?.primary,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Text
                                                        style={{ ...styles.txt22bold, color: 'white' }}
                                                    >
                                                        {item?.order_details?.customer_details?.full_name.slice(0, 1)}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.txt10}>Recieved from</Text>
                                                    <Text style={styles.txt16}>{item?.order_details?.customer_details?.full_name}</Text>
                                                </View>
                                            </View>

                                        </View>
                                        <View>

                                            <Text style={{ ...styles.txt16bold, textAlign: 'right' }}>₹{item?.mechanic_fees}</Text>

                                        </View>

                                    </View>
                                </View>
                            )}
                            onEndReached={loadMoreData}
                            onEndReachedThreshold={0.5} // Trigger when 50% of the list is visible
                            ListFooterComponent={loadingactivity ? <ActivityIndicator /> : null}

                            ListEmptyComponent={
                                !loadingactivity && (
                                    <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center' }}>
                                            No payemnts yet!
                                        </Text>
                                    </View>
                                )
                            }
                        />
                    </>
                    :
                    <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#888', alignSelf: 'center' }}>
                            No payemnts yet!
                        </Text>
                    </View>
                }

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showFilterModal}
                    onRequestClose={() => setShowFilterModal(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                            <Text style={{ ...styles.txt18bold, marginBottom: 10 }}>Sort By:-</Text>

                            <TouchableOpacity onPress={() => { setSortOrder('asc'); handleFilterSearch(search, 'asc'); setShowFilterModal(false); }}>
                                <Text style={{ ...styles.txt16, marginBottom: 6 }}>Lowest Amount</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setSortOrder('desc'); handleFilterSearch(search, 'desc'); setShowFilterModal(false); }}>
                                <Text style={{ ...styles.txt16, marginBottom: 6 }}>Highest Amount</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setSortOrder(null); handleFilterSearch(search, null); setShowFilterModal(false); }}>
                                <Text style={{ ...styles.txt16, marginBottom: 6 }}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>






        </View>
    )
}

export default Transaction