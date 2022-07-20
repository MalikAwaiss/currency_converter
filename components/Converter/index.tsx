import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

// i can make my own picker, but due to short time, using a package
export const Converter = () => {
    const [state, setState] = React.useState<any>({
        data: {},
        baseCurrency: 'USD',
        targetCurrency: 'USD',
        convertedAmount: 0,
        baseCurrencyValue: 0,
        keys: [],
        loading: true,
        baseAmountInWords: '',
        convertedAmountInWords: '',
    });
    const pickerRef = React.useRef<any>(null);
    const fetchData = () => {
        fetch('https://freecurrencyapi.net/api/v2/latest?apikey=a6baae60-726e-11ec-b4e1-dd0810336ebf').then(response => response.json()).then(response => {
            console.log('data', response)
            const keys = Object.keys(response.data).map((item) => {
                return {
                    label: item,
                    value: item,
                }
            })
            setState((pre: any) => ({ ...pre, loading: false, keys, data: response.data }))
        });

    }
    const calculations = (val: string, targetValue: string = state.targetCurrency) => {

        const value = parseFloat(val);
        const amount = value ? parseFloat((value * state.data[targetValue]).toFixed(2)) : 0;
        console.log('targetValue', amount);
        return { amount: amount, amountInWords: currencyToWordsConverter(amount) };
    }
    const calculateCurrency = (val: string) => {
        const convertedAmount = calculations(val);
        setState((pre: any) => ({ ...pre, convertedAmount: convertedAmount.amount, convertedAmountInWords: convertedAmount.amountInWords, baseAmountInWords: currencyToWordsConverter(val), baseCurrencyValue: val }));
    }
    const currencyToWordsConverter = (val: any) => {
        if (parseFloat(val) === 0) return '';
        const splitted = val.toString().split('.');
        const amount = splitted[0];
        let afterFloating = splitted[1];
        let a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        let b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        function inWords(num: any) {
            if ((num = num.toString()).length > 9) return 'overflow';
            let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return; var str = '';

            str += (parseInt(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
            str += (parseInt(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
            str += (parseInt(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
            str += (parseInt(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + (a[n[4][1]] || '')) + 'hundred ' : '';
            str += (parseInt(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
            console.log('afterFloating', n, afterFloating)
            if (afterFloating) {
                afterFloating = afterFloating.length === 1 ? afterFloating + '0' : afterFloating;
                afterFloating = afterFloating.split('')
                str += 'point ';
                afterFloating.map((item: any) => {
                    str += a[item];
                });
            }
            return str;
        }
        return inWords(amount);
    }
    React.useEffect(() => {
        fetchData();
    }, []);
    return (
        <>
            {
                state.loading ? <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 999, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Loading Currencies...</Text>
                </View> : null
            }
            <View style={{ flex: 1, padding: 40 }}>
                <View style={{ flex: 2 }}>
                    <View style={[styles.currencyContainer]}>
                        <View style={[styles.currencyInnerContainer, styles.currencyTopContainer]}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <TextInput
                                    style={{ height: 40, fontSize: 18 }}
                                    onChangeText={calculateCurrency}
                                />
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>{state.baseCurrency}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={{ alignSelf: 'center' }}>||</Text>
                    <View style={styles.currencyContainer}>
                        <View style={[styles.currencyInnerContainer, styles.currencyBottomContainer]}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>{state.convertedAmount}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Picker
                                    ref={pickerRef}
                                    selectedValue={state.targetCurrency}
                                    style={{ height: 40, width: 150 }}
                                    onValueChange={(itemValue: any) => {
                                        const amountObj = parseFloat(state.baseCurrencyValue) > 0 ? calculations(state.baseCurrencyValue, itemValue) : { amount: 0, amountInWords: '' };

                                        setState((pre: any) => ({ ...pre, targetCurrency: itemValue, convertedAmount: amountObj.amount, convertedAmountInWords: amountObj.amountInWords }));
                                    }}>
                                    {state.keys.map((item: object, index: number) => {
                                        return <Picker.Item key={index} label={item['label']} value={item['value']} />
                                    })}
                                </Picker>
                            </View>
                        </View>
                    </View>
                    <Text>{state.baseCurrency}:  {state.baseAmountInWords + '\n'}</Text>
                    <Text>{state.targetCurrency}:  {state.convertedAmountInWords}</Text>
                </View>
                <View style={{ flex: 1 }}></View>
            </View>
        </>
    );
}
const styles = StyleSheet.create({
    currencyContainer: {
        flex: 1, padding: 30,
    },
    currencyInnerContainer: {
        flex: 1, backgroundColor: '#DAE3F2',
        flexDirection: 'column'
    },
    currencyTopContainer: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    currencyBottomContainer: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },


});