import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useActivedColors} from '@/hooks';
import {common} from '@/assets/styles';
import {MaterialIcons} from '@expo/vector-icons';
import moment from 'moment';
import {TouchableOpacity} from 'react-native-gesture-handler';
import FocusTimeChart from '@/components/Statistic/FocusTimeChart';

interface ITabProps {
  tab: 'Daily' | 'Weekly' | 'Monthly' | 'Annually';
  tabActive: 'Daily' | 'Weekly' | 'Monthly' | 'Annually';
  onPress: () => void;
}

const Tab: React.FC<ITabProps> = ({tab, tabActive, onPress}) => {
  const activedColors = useActivedColors();

  return (
    <Text
      style={[
        styles.tab,
        {
          color: tab == tabActive ? activedColors.text : activedColors.textSec,
          backgroundColor:
            tab == tabActive ? activedColors.background : 'transparent',
        },
      ]}
      onPress={onPress}>
      {tab}
    </Text>
  );
};

const Overview = () => {
  const activedColors = useActivedColors();

  const [tabActive, setTabActive] = useState<
    'Daily' | 'Weekly' | 'Monthly' | 'Annually'
  >('Daily');
  const [startDate, setStartDate] = useState(moment().startOf('day'));
  const [endDate, setEndDate] = useState(moment().endOf('day'));
  const [timeUnit, setTimeUnit] =
    useState<moment.unitOfTime.DurationConstructor>('days');
  const [timeString, setTimeString] = useState('Today');

  useEffect(() => {
    switch (tabActive) {
      case 'Daily':
        setTimeUnit('days');
        setTimeString(
          startDate.isSame(moment(), 'day')
            ? 'Today'
            : startDate.format('DD/MM'),
        );
        break;
      case 'Weekly':
        setTimeUnit('weeks');
        setTimeString(
          startDate.format('DD/MM') + ' - ' + endDate.format('DD/MM'),
        );
        break;
      case 'Monthly':
        setTimeUnit('months');
        setTimeString(startDate.format('MM/YYYY'));
        break;
      case 'Annually':
        setTimeUnit('years');
        setTimeString(startDate.format('YYYY'));
        break;
    }
  }, [tabActive, startDate]);

  useEffect(() => {
    const unit = timeUnit != 'weeks' ? timeUnit : 'isoWeek';
    setStartDate(moment().startOf(unit));
    setEndDate(moment().endOf(unit));
  }, [timeUnit]);

  const prevTime = () => {
    setStartDate(startDate.clone().subtract(1, timeUnit));
    setEndDate(endDate.clone().subtract(1, timeUnit));
  };

  const nextTime = () => {
    setStartDate(startDate.clone().add(1, timeUnit));
    setEndDate(endDate.clone().add(1, timeUnit));
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: activedColors.input,
      }}>
      <View style={[styles.card, {backgroundColor: activedColors.background}]}>
        <Text
          style={[common.text, {fontWeight: '600', color: activedColors.text}]}>
          Focus time
        </Text>
        <View
          style={{
            marginTop: 10,
            borderTopWidth: 2,
            borderTopColor: activedColors.backgroundSec,
          }}>
          <View style={[styles.tabs, {backgroundColor: activedColors.input}]}>
            <Tab
              tab="Daily"
              tabActive={tabActive}
              onPress={() => setTabActive('Daily')}
            />
            <Tab
              tab="Weekly"
              tabActive={tabActive}
              onPress={() => setTabActive('Weekly')}
            />
            <Tab
              tab="Monthly"
              tabActive={tabActive}
              onPress={() => setTabActive('Monthly')}
            />
            <Tab
              tab="Annually"
              tabActive={tabActive}
              onPress={() => setTabActive('Annually')}
            />
          </View>
          <View
            style={{
              marginTop: 10,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              onPress={() => {
                prevTime();
              }}>
              <MaterialIcons
                name="keyboard-arrow-left"
                size={28}
                color={activedColors.text}
                style={{padding: 4}}
              />
            </TouchableOpacity>
            <Text
              style={[
                common.text,
                {color: activedColors.text, flex: 1, textAlign: 'center'},
              ]}>
              {timeString}
            </Text>
            <TouchableOpacity onPress={nextTime}>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={28}
                color={activedColors.text}
                style={{padding: 4}}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{}}>
          <FocusTimeChart />
        </View>
      </View>
    </View>
  );
};

export default Overview;

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    borderRadius: 10,
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 10,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 10,
    textAlign: 'center',
  },
});
