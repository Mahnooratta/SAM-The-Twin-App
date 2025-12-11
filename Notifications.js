import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

function Notifications({ navigation }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Message', message: 'You have a new message from John', time: '2 hours ago', read: false },
    { id: 2, title: 'Task Reminder', message: 'Complete your daily journal entry', time: '5 hours ago', read: false },
    { id: 3, title: 'Check-in Reminder', message: "Don't forget to check in today", time: '1 day ago', read: true },
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      
      <ScrollView style={styles.notificationsList}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        ) : (
          notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.unreadCard]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

export default Notifications;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2', padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A3A3A' },
  notificationsList: { flex: 1 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  notificationCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: '#D6A84F' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  notificationMessage: { fontSize: 14, color: '#666', marginBottom: 4 },
  notificationTime: { fontSize: 12, color: '#999' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D6A84F', marginLeft: 10 }
});

