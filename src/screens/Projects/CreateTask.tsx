import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  AntDesign,
  Feather,
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import {useActivedColors, useAppSelector} from '@/hooks';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {common} from '@/assets/styles';
import {IUser, ProjectsStackScreenProps} from '@/types';
import {APP_QR_ID, PRIORITY_COLORS} from '@/constants';
import {IPriority, ITask} from '@/types';
import {generatorId, secondsToMinutes} from '@/utils';
import SafeView from '@/components/Layout/SafeView';
import Header from '@/components/Layout/Header';
import UInput from '@/components/UI/UInput';
import PriorityDropdown from '@/components/Task/PriorityDropdown';
import AssigneeUserItem from '@/components/Task/AssigneeUserItem';
import PomodoroPicker from '@/components/Modal/PomodoroPicker';
import BreaktimePicker from '@/components/Modal/BreaktimePicker';
import MCalendarPicker from '@/components/Modal/MCalendarPicker';
import moment from 'moment';
import QRModal from '@/components/Modal/QRModal';
import FindColleague from '@/components/Task/FindColleague';
import UButton from '@/components/UI/UButton';
import {useTask} from '@/hooks/useTask';
import {useNotification} from '@/hooks/useNotification';
import FindColleagueDropdown from '@/components/Task/FindColleagueDropdown';

const CreateTask = () => {
  const activedColors = useActivedColors();
  const navigation =
    useNavigation<ProjectsStackScreenProps<'CreateTask'>['navigation']>();
  const route = useRoute<ProjectsStackScreenProps<'CreateTask'>['route']>();

  const {user} = useAppSelector(state => state.user);
  const {project} = useAppSelector(state => state.projects);
  const {tasks} = useAppSelector(state => state.tasks);
  const {colleagues} = useAppSelector(state => state.colleagues);

  const {createTask, updateTask} = useTask();
  const {createNotification} = useNotification();

  const [task, setTask] = useState<ITask>({
    id: generatorId(),
    projectId: route.params.projectId,
    name: '',
    priority: 'none',
    isDone: false,
    totalPomodoro: 1,
    pomodoroCount: 0,
    longBreak: 25 * 60,
    shortBreak: 5 * 60,
    deadline: null,
    assignee: null,
    createdAt: '',
    completedBy: null,
    completedAt: '',
  });
  const [isReady, setIsReady] = useState(false);
  const [QRValue, setQRValue] = useState('');
  const [oldAssigneeId, setOldAssigneeId] = useState<string | null>(null);
  const [assigneeUser, setAssigneeUser] = useState<IUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [findColleague, setFindColleague] = useState<IUser[] | null>(null);
  const [projectColleagues, setProjectColleagues] = useState<IUser[]>([user!]);

  const [activePriority, setActivePriority] = useState(false);
  const [activePomodoroPicker, setActivePomodoroPicker] = useState(false);
  const [activeBreaktimePicker, setActiveBreaktimePicker] = useState(false);
  const [activeCalendarPicker, setActiveCalendarPicker] = useState(false);
  const [activeFindColleague, setActiveFindColleague] = useState(false);
  const [activeQRCode, setActiveQRCode] = useState(false);

  const [errorName, setErrorName] = useState('');
  const [validTask, setValidTask] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false); //Permission to update task

  useEffect(() => {
    setIsOwner(project?.ownerId == user?.id);
    let taskTemp: ITask | undefined;

    if (route.params.taskId) {
      taskTemp = tasks?.find(item => item.id == route.params.taskId);

      if (!taskTemp) {
        // Not found
        setValidTask(false);
      } else {
        // Founded
        if (
          project?.ownerId == user?.id ||
          taskTemp.assignee == null ||
          taskTemp.assignee == user!.id
        ) {
          setHasPermission(true);
        }
        setTask(taskTemp);
      }
    }
    setIsLoading(false);

    if (colleagues) {
      const projectColleaguesTemp: IUser[] = colleagues
        .filter(item => project!.team.includes(item.colleagueId))
        .map(item => ({
          id: item.colleagueId,
          username: item.colleagueUsername,
          avatar: item.colleagueAvatar,
          email: item.colleagueEmail,
        }));
      projectColleaguesTemp.unshift(user!);

      setProjectColleagues(projectColleaguesTemp);

      setOldAssigneeId(taskTemp?.assignee || null);

      const assigneeTemp: IUser | null =
        projectColleaguesTemp.find(item => taskTemp?.assignee == item.id) ||
        null;

      setAssigneeUser(assigneeTemp);
    }
  }, [route.params.taskId]);

  useEffect(() => {
    if (isReady) {
      setQRValue(
        JSON.stringify({
          id: APP_QR_ID, // ID của riêng project
          project: project,
          task: task,
          owner: user,
        }),
      );
    }
  }, [isReady]);

  const handleSaveTask = async () => {
    if (task.name.trim() == '') {
      setErrorName('Please enter task name.');
    } else {
      setErrorName('');

      const updatedTask = {
        ...task,
        assignee: assigneeUser?.id || null,
      };
      setTask(updatedTask);

      // Update or create task
      if (route.params.taskId) {
        updateTask(route.params.taskId, updatedTask);
      } else {
        createTask({...updatedTask, createdAt: new Date().toISOString()});
      }

      navigation.navigate('Tasks', {projectId: route.params.projectId});

      // Check add/ remove
      // Add
      if (
        assigneeUser &&
        assigneeUser.id != user?.id &&
        assigneeUser.id != oldAssigneeId
      ) {
        createNotification({
          id: generatorId(),
          senderId: user!.id,
          senderUsername: user!.username,
          senderAvatar: user!.avatar,
          receiverId: assigneeUser.id,
          type: 'assign',
          subType: 'add',
          isRead: false,
          content: 'added you to',
          projectId: project?.id,
          projectName: project?.name,
          taskId: task.id,
          taskName: task.name,
          createdAt: new Date().toISOString(),
        });
      }

      // Delete
      if (
        oldAssigneeId &&
        oldAssigneeId != user?.id &&
        oldAssigneeId != assigneeUser?.id
      ) {
        createNotification({
          id: generatorId(),
          senderId: user!.id,
          senderUsername: user!.username,
          senderAvatar: user!.avatar,
          receiverId: oldAssigneeId,
          type: 'assign',
          subType: 'remove',
          isRead: false,
          content: 'removed you from',
          projectId: project?.id,
          projectName: project?.name,
          taskId: task.id,
          taskName: task.name,
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  const leftTask = async () => {
    if (route.params.taskId) {
      const updatedTask = {
        ...task,
        assignee: null,
      };

      navigation.navigate('Tasks', {projectId: route.params.projectId});
      await updateTask(route.params.taskId, updatedTask);
      if (project?.ownerId != user?.id) {
        await createNotification({
          id: generatorId(),
          senderId: user!.id,
          senderUsername: user!.username,
          senderAvatar: user!.avatar,
          receiverId: project!.ownerId,
          type: 'assign',
          subType: 'left',
          isRead: false,
          content: 'left',
          projectId: project?.id,
          projectName: project?.name,
          taskId: task.id,
          taskName: task.name,
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  const checkTask = () => {
    const isTaskDone = !task.isDone;
    setTask({
      ...task,
      isDone: isTaskDone,
      completedBy: isTaskDone ? user!.id : null,
      completedAt: isTaskDone ? new Date().toISOString() : '',
    });
  };

  const setPriority = (level: IPriority) => {
    setTask({
      ...task,
      priority: level,
    });
    setActivePriority(false);
  };

  const setName = (value: string) => {
    setTask({
      ...task,
      name: value,
    });
  };

  const savePomodoro = (pomodoros: number, pomodoroLength: number) => {
    if (pomodoros <= task.pomodoroCount) {
      setTask({
        ...task,
        isDone: true,
        pomodoroCount: pomodoros,
        totalPomodoro: pomodoros,
        longBreak: pomodoroLength,
        completedBy: user!.id,
        completedAt: new Date().toISOString(),
      });
    } else {
      setTask({
        ...task,
        isDone: false,
        totalPomodoro: pomodoros,
        longBreak: pomodoroLength,
        completedBy: null,
        completedAt: '',
      });
    }
    setActivePomodoroPicker(false);
  };

  const saveBreaktime = (breakLength: number) => {
    setTask({
      ...task,
      shortBreak: breakLength,
    });
    setActiveBreaktimePicker(false);
  };

  const saveDeadline = (date: Date | null) => {
    setTask({
      ...task,
      deadline: date?.toISOString() || null,
    });
    setActiveCalendarPicker(false);
  };

  const onClickColleague = (colleague: IUser | null) => {
    setAssigneeUser(colleague);

    setFindColleague(null);

    setActiveFindColleague(false);
  };

  const clickPlayTask = () => {
    navigation.navigate('Pomodoro', {task: task});
  };

  if (!validTask) {
    return (
      <SafeView>
        <Header title={route.params.taskId ? 'Edit Task' : 'Create Task'}>
          {{
            leftChild: (
              <Feather
                name="x"
                size={24}
                color={activedColors.text}
                onPress={() =>
                  navigation.navigate('Tasks', {
                    projectId: route.params.projectId,
                  })
                }
              />
            ),
          }}
        </Header>
        <View style={[common.container]}>
          <Text style={[common.text, {color: activedColors.text}]}>
            Task not found The task doesn't seem to exist or you don't have
            permission to access it.
          </Text>
        </View>
      </SafeView>
    );
  }

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="height" enabled={false}>
      <SafeView
        clickOutSide={() => {
          setActivePriority(false), setActiveFindColleague(false);
        }}>
        <Header title={route.params.taskId ? task?.name : 'Create Task'}>
          {{
            leftChild: (
              <Feather
                name="x"
                size={24}
                color={activedColors.text}
                onPress={() => navigation.goBack()}
              />
            ),
            rightChild: (
              <View style={{flexDirection: 'row', gap: 15}}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActiveQRCode(true)}>
                  <Ionicons
                    name="qr-code-outline"
                    size={22}
                    color={activedColors.text}
                  />
                </TouchableOpacity>
                {hasPermission && (
                  <TouchableOpacity activeOpacity={0.7} onPress={clickPlayTask}>
                    <AntDesign
                      name="playcircleo"
                      size={22}
                      color={activedColors.text}
                    />
                  </TouchableOpacity>
                )}
                {hasPermission && !isOwner && task?.assignee && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => leftTask()}>
                    <Feather
                      name="log-out"
                      size={22}
                      color={activedColors.text}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ),
          }}
        </Header>
        {isLoading ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size={30} color={activedColors.textSec} />
          </View>
        ) : (
          <>
            <View style={{flex: 1, width: '100%'}}>
              <View
                style={[
                  styles.item,
                  {
                    zIndex: 1,
                    paddingVertical: 0,
                    marginTop: 20,
                    backgroundColor: activedColors.input,
                  },
                ]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={checkTask}
                  style={[
                    styles.check,
                    {
                      borderColor: PRIORITY_COLORS[task.priority].default,
                      backgroundColor: PRIORITY_COLORS[task.priority].light,
                    },
                  ]}>
                  {task.isDone && (
                    <Feather
                      name="check"
                      size={16}
                      color={activedColors.primary}
                    />
                  )}
                </TouchableOpacity>
                <UInput
                  value={task.name}
                  onChangeText={setName}
                  placeholder="Task name"
                  style={{flex: 1, width: 'auto'}}
                />
                <PriorityDropdown
                  activePriority={activePriority}
                  setActivePriority={setActivePriority}
                  priority={task.priority}
                  setPriority={setPriority}
                />
              </View>
              <Text
                style={[
                  common.small,
                  {marginLeft: 70, color: activedColors.error},
                ]}>
                {errorName}
              </Text>
              <View style={{marginTop: 10, flex: 1}}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActivePomodoroPicker(true)}
                  style={[
                    styles.item,
                    {
                      flexDirection: 'row',
                      backgroundColor: activedColors.input,
                    },
                  ]}>
                  <Fontisto
                    name="stopwatch"
                    size={20}
                    color={activedColors.textSec}
                  />
                  <Text
                    style={[
                      common.text,
                      styles.title,
                      {color: activedColors.text},
                    ]}>
                    Pomodoro
                  </Text>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 'auto',
                      }}>
                      <MaterialCommunityIcons
                        name="clock-time-four"
                        size={16}
                        color={activedColors.primary}
                      />
                      <Text
                        style={[common.small, {color: activedColors.primary}]}>
                        {task.pomodoroCount} /
                      </Text>
                      <MaterialCommunityIcons
                        name="clock-time-four"
                        size={16}
                        color={activedColors.primaryLight}
                      />
                      <Text
                        style={[
                          common.small,
                          {color: activedColors.primaryLight},
                        ]}>
                        {task.totalPomodoro}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 'auto',
                      }}>
                      <MaterialCommunityIcons
                        name="clock-time-four"
                        size={14}
                        color={activedColors.primary}
                      />
                      <Text
                        style={[common.small, {color: activedColors.textSec}]}>
                        {' '}
                        = {secondsToMinutes(task.longBreak)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActiveBreaktimePicker(true)}
                  style={[styles.item, {backgroundColor: activedColors.input}]}>
                  <MaterialCommunityIcons
                    name="party-popper"
                    size={20}
                    color={activedColors.textSec}
                  />
                  <Text
                    style={[
                      common.text,
                      styles.title,
                      {color: activedColors.text},
                    ]}>
                    Breaktime
                  </Text>
                  <Text style={[common.text, {color: activedColors.textSec}]}>
                    {secondsToMinutes(task.shortBreak)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActiveCalendarPicker(true)}
                  style={[styles.item, {backgroundColor: activedColors.input}]}>
                  <FontAwesome
                    name="calendar"
                    size={20}
                    color={activedColors.textSec}
                  />
                  <Text
                    style={[
                      common.text,
                      styles.title,
                      {color: activedColors.text},
                    ]}>
                    Deadline
                  </Text>
                  <Text style={[common.text, {color: activedColors.textSec}]}>
                    {task.deadline
                      ? moment(new Date(task.deadline)).format('dddd, D MMMM')
                      : 'Someday'}
                  </Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.assigneeWrap,
                    {backgroundColor: activedColors.input},
                  ]}>
                  <View style={styles.assigneeHeader}>
                    <MaterialIcons
                      name="groups"
                      size={20}
                      color={activedColors.textSec}
                    />
                    <Text
                      style={[
                        common.text,
                        styles.title,
                        {color: activedColors.text},
                      ]}>
                      Assignee
                    </Text>
                    <FindColleagueDropdown
                      activeFindColleague={activeFindColleague}
                      setActiveFindColleague={setActiveFindColleague}
                      assigneeUser={assigneeUser}
                      projectColleagues={projectColleagues}
                      onClickColleague={onClickColleague}
                    />
                  </View>
                </View>
              </View>
              {isOwner && (
                <UButton
                  primary
                  style={{
                    width: 'auto',
                    marginHorizontal: 16,
                    marginBottom: 10,
                  }}
                  onPress={handleSaveTask}>
                  <Text style={[common.text, {color: '#fff'}]}>Save</Text>
                </UButton>
              )}
              {!isOwner && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 10,
                  }}
                />
              )}
            </View>
            <View style={{position: 'absolute'}}>
              {activeQRCode && (
                <QRModal
                  value={QRValue}
                  onClickOutside={() => setActiveQRCode(false)}
                  onClose={() => setActiveQRCode(false)}
                />
              )}
              {activePomodoroPicker && (
                <PomodoroPicker
                  initPomodoro={task.totalPomodoro}
                  initPomodoroLength={task.longBreak / 60}
                  onClickOutside={() => setActivePomodoroPicker(false)}
                  onClose={() => setActivePomodoroPicker(false)}
                  onSave={savePomodoro}
                />
              )}
              {activeBreaktimePicker && (
                <BreaktimePicker
                  initShortBreak={task.shortBreak / 60}
                  onClickOutside={() => setActiveBreaktimePicker(false)}
                  onClose={() => setActiveBreaktimePicker(false)}
                  onSave={saveBreaktime}
                />
              )}
              {activeCalendarPicker && (
                <MCalendarPicker
                  onClickOutside={() => setActiveCalendarPicker(false)}
                  onClose={() => setActiveCalendarPicker(false)}
                  onSave={saveDeadline}
                />
              )}
            </View>
          </>
        )}
      </SafeView>
    </KeyboardAvoidingView>
  );
};

export default CreateTask;

const styles = StyleSheet.create({
  item: {
    marginVertical: 4,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    marginLeft: 20,
  },
  assigneeWrap: {
    marginVertical: 4,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assigneeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  assigneeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 16,
  },
});
