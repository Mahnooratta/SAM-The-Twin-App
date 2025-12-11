import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';

function Tasks({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState("Normal");
  const [category, setCategory] = useState("General");
  const [reminder, setReminder] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("list"); // list or calendar

  // Format date for display
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time for display
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle date selection
  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      // Update time to match selected date
      const newDateTime = new Date(date);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setSelectedTime(newDateTime);
      // Update dueDate string
      const dateStr = formatDate(date);
      const timeStr = formatTime(selectedTime);
      setDueDate(`${dateStr} ${timeStr}`);
    }
  };

  // Handle time selection
  const onTimeChange = (event, date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedTime(date);
      // Update dueDate string with new time
      const dateStr = formatDate(selectedDate);
      const timeStr = formatTime(date);
      setDueDate(`${dateStr} ${timeStr}`);
    }
  };

  // Open date picker
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Open time picker
  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  // Add or Update Task
  const handleSave = () => {
    if (!taskTitle || !taskDesc) {
      Alert.alert("Error", "Please enter task title and description");
      return;
    }

    if (editId !== null) {
      setTasks(tasks.map(task =>
        task.id === editId ? { ...task, taskTitle, taskDesc, dueDate, priority, category, reminder } : task
      ));
      setEditId(null);
    } else {
      const newTask = {
        id: Date.now(),
        taskTitle,
        taskDesc,
        dueDate,
        priority,
        category,
        reminder,
        completed: false
      };
      setTasks([newTask, ...tasks]);
    }

    // Reset form
    setTaskTitle("");
    setTaskDesc("");
    setDueDate("");
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setPriority("Normal");
    setCategory("General");
    setReminder(false);
  };

  // Edit Task
  const handleEdit = (id) => {
    const task = tasks.find(t => t.id === id);
    setTaskTitle(task.taskTitle);
    setTaskDesc(task.taskDesc);
    setDueDate(task.dueDate);
    
    // Parse existing dueDate if available
    if (task.dueDate) {
      try {
        const dateTime = new Date(task.dueDate);
        if (!isNaN(dateTime.getTime())) {
          setSelectedDate(dateTime);
          setSelectedTime(dateTime);
        }
      } catch (e) {
        // If parsing fails, use current date/time
        setSelectedDate(new Date());
        setSelectedTime(new Date());
      }
    }
    
    setPriority(task.priority);
    setCategory(task.category);
    setReminder(task.reminder);
    setEditId(id);
  };

  // Delete Task
  const handleDelete = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => setTasks(tasks.filter(t => t.id !== id)) }
      ]
    );
  };

  // Toggle Complete
  const toggleComplete = (id) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === "All") return true;
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    if (filter === "High" || filter === "Normal" || filter === "Low") return task.priority === filter;
    return true;
  });

  // Tasks grouped by date for calendar
  const tasksByDate = {};
  tasks.forEach(task => {
    if (task.dueDate) {
      try {
        const dateKey = new Date(task.dueDate).toDateString();
        if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
        tasksByDate[dateKey].push(task);
      } catch (e) {
        // Skip invalid dates
      }
    }
  });

  // Get all days of current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= lastDate; i++) calendarDays.push(new Date(year, month, i));

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backText}>⬅ Home</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Tasks & To-Do List</Text>
        <TouchableOpacity
          style={styles.toggleViewButton}
          onPress={() => setView(view === "list" ? "calendar" : "list")}
        >
          <Text style={styles.toggleViewText}>
            {view === "list" ? "📅 Calendar" : "📝 List"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List View */}
      {view === "list" && (
        <>
          {/* Filters */}
          <View style={styles.filters}>
            <Text style={styles.filterLabel}>Filter:</Text>
            <Picker
              selectedValue={filter}
              style={styles.picker}
              onValueChange={(itemValue) => setFilter(itemValue)}
              mode="dropdown"
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Completed" value="Completed" />
              <Picker.Item label="High Priority" value="High" />
              <Picker.Item label="Normal Priority" value="Normal" />
              <Picker.Item label="Low Priority" value="Low" />
            </Picker>
          </View>

          {/* Task Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              value={taskDesc}
              onChangeText={setTaskDesc}
              multiline
              textAlignVertical="top"
            />
            
            {/* Date Picker */}
            <View style={styles.dateTimeContainer}>
              <Text style={styles.label}>Due Date & Time</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity style={styles.dateTimeButton} onPress={openDatePicker}>
                  <Text style={styles.dateTimeButtonText}>
                    📅 {dueDate ? formatDate(selectedDate) : "Select Date"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateTimeButton} onPress={openTimePicker}>
                  <Text style={styles.dateTimeButtonText}>
                    🕐 {dueDate ? formatTime(selectedTime) : "Select Time"}
                  </Text>
                </TouchableOpacity>
              </View>
              {dueDate && (
                <Text style={styles.selectedDateTime}>
                  Selected: {dueDate}
                </Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                is24Hour={false}
              />
            )}

            <Picker
              selectedValue={priority}
              style={styles.picker}
              onValueChange={(itemValue) => setPriority(itemValue)}
            >
              <Picker.Item label="Normal" value="Normal" />
              <Picker.Item label="High" value="High" />
              <Picker.Item label="Low" value="Low" />
            </Picker>
            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="General" value="General" />
              <Picker.Item label="Work" value="Work" />
              <Picker.Item label="Personal" value="Personal" />
              <Picker.Item label="Journal-linked" value="Journal-linked" />
            </Picker>
            <View style={styles.reminderContainer}>
              <Text style={styles.reminderLabel}>Reminder</Text>
              <Switch value={reminder} onValueChange={setReminder} />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>
                {editId !== null ? "Update Task" : "Add Task"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Task List */}
          <ScrollView style={styles.taskList} showsVerticalScrollIndicator={true}>
            {filteredTasks.length === 0 ? (
              <Text style={styles.noTasks}>No tasks found.</Text>
            ) : (
              filteredTasks.map(task => (
                <View key={task.id} style={[styles.taskItem, task.completed && styles.completedItem]}>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
                      {task.taskTitle}
                    </Text>
                    <Text style={[styles.taskDesc, task.completed && styles.completedText]}>
                      {task.taskDesc}
                    </Text>
                    <Text style={styles.taskDate}>
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View style={[
                        styles.priorityBadge,
                        task.priority === "High" ? styles.high : 
                        task.priority === "Low" ? styles.low : styles.normal
                      ]}>
                        <Text style={styles.priorityText}>{task.priority}</Text>
                      </View>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{task.category}</Text>
                      </View>
                      {task.reminder && <Text style={styles.reminderIcon}>⏰</Text>}
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.completeBtn]} 
                      onPress={() => toggleComplete(task.id)}
                    >
                      <Text style={styles.actionBtnText}>
                        {task.completed ? "Undo" : "Complete"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.editBtn]} 
                      onPress={() => handleEdit(task.id)}
                    >
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.deleteBtn]} 
                      onPress={() => handleDelete(task.id)}
                    >
                      <Text style={styles.actionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <ScrollView style={styles.calendarView}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarMonth}>
              {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <View key={day} style={styles.calendarDayHeader}>
                <Text style={styles.calendarDayHeaderText}>{day}</Text>
              </View>
            ))}
            {calendarDays.map((date, idx) => (
              <View key={idx} style={styles.calendarDay}>
                {date ? (
                  <>
                    <Text style={styles.calendarDate}>{date.getDate()}</Text>
                    <View style={styles.calendarTasks}>
                      {(tasksByDate[date.toDateString()] || []).map(task => (
                        <View 
                          key={task.id} 
                          style={[
                            styles.calendarTask,
                            task.completed && styles.calendarTaskCompleted
                          ]}
                        >
                          <Text 
                            style={[
                              styles.calendarTaskText,
                              task.completed && styles.calendarTaskTextCompleted
                            ]}
                            numberOfLines={1}
                          >
                            {task.taskTitle} {task.reminder && "⏰"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default Tasks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FAF7F2",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: "#D6A84F",
    borderRadius: 10,
    marginRight: 10,
  },
  backText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3A3A3A",
    flex: 1,
  },
  toggleViewButton: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: "#D6A84F",
    borderRadius: 10,
  },
  toggleViewText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  filters: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  form: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginBottom: 8,
  },
  dateTimeContainer: {
    marginBottom: 15,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: "#D6A84F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  dateTimeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  selectedDateTime: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingVertical: 5,
  },
  reminderLabel: {
    fontSize: 16,
    color: "#3A3A3A",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#D6A84F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  completedItem: {
    opacity: 0.7,
  },
  taskInfo: {
    marginBottom: 10,
  },
  taskTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#3A3A3A",
    marginBottom: 5,
  },
  taskDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  taskDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  high: {
    backgroundColor: "#FF6B6B",
  },
  normal: {
    backgroundColor: "#FFD966",
  },
  low: {
    backgroundColor: "#6BCB77",
  },
  categoryBadge: {
    backgroundColor: "#A0C4FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  reminderIcon: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionBtn: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  completeBtn: {
    backgroundColor: "#6BCB77",
  },
  editBtn: {
    backgroundColor: "#FFD966",
  },
  deleteBtn: {
    backgroundColor: "#FF6B6B",
  },
  actionBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  noTasks: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: 16,
  },
  // Calendar Styles
  calendarView: {
    flex: 1,
  },
  calendarHeader: {
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 2,
  },
  calendarMonth: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3A3A3A",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDayHeader: {
    width: "14.28%",
    padding: 8,
    alignItems: "center",
    backgroundColor: "#D6A84F",
  },
  calendarDayHeaderText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 12,
  },
  calendarDay: {
    width: "14.28%",
    borderWidth: 1,
    borderColor: "#E8E2D6",
    minHeight: 80,
    padding: 5,
    backgroundColor: "#FAF7F2",
  },
  calendarDate: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#3A3A3A",
    marginBottom: 4,
  },
  calendarTasks: {
    flex: 1,
  },
  calendarTask: {
    backgroundColor: "#D6A84F",
    padding: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  calendarTaskCompleted: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  calendarTaskText: {
    fontSize: 9,
    color: "white",
    fontWeight: "bold",
  },
  calendarTaskTextCompleted: {
    textDecorationLine: "line-through",
  },
});