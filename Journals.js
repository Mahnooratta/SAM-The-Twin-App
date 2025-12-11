import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from './firebase';
import firestore from '@react-native-firebase/firestore';

function Journals({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showForm, setShowForm] = useState(false); // New state for two-step UI

  // Get current user and load journals
  useEffect(() => {
    let authUnsubscribe;
    let journalsUnsubscribe;
    
    authUnsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        // Set up real-time listener for journals
        journalsUnsubscribe = loadJournals(user.uid);
      } else {
        setLoading(false);
        // Redirect to login if not authenticated
        navigation.navigate('Login');
      }
    });

    // Cleanup function
    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (journalsUnsubscribe) journalsUnsubscribe();
    };
  }, [navigation]);

  // Reload journals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Real-time listener automatically updates when screen is focused
    }, [userId])
  );

  // READ: Load journals from Firestore with real-time updates
  const loadJournals = (uid) => {
    try {
      setLoading(true);
      
      const db = firestore();
      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const journalsRef = db
        .collection('users')
        .doc(uid)
        .collection('journals');

      // Set up real-time listener
      const unsubscribe = journalsRef.onSnapshot(
        (snapshot) => {
          const journals = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            journals.push({
              id: doc.id,
              title: data.title || '',
              content: data.content || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });
          
          // Sort by createdAt on client-side (newest first)
          journals.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.()?.getTime() || a.createdAt || 0;
            const bTime = b.createdAt?.toDate?.()?.getTime() || b.createdAt || 0;
            return bTime - aTime;
          });

          setEntries(journals);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading journals:', error);
          let errorMessage = 'Failed to load journals';
          
          if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. Please check Firestore security rules.';
          } else if (error.code === 'unavailable') {
            errorMessage = 'Firestore is unavailable. Please check your connection.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          Alert.alert("Error Loading Journals", `${errorMessage}\n\nError Code: ${error.code || 'N/A'}`);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up listener:', error);
      Alert.alert("Error", `Failed to load journals: ${error.message || 'Unknown error'}`);
      setLoading(false);
      return () => {};
    }
  };

  // CREATE: Add new journal entry
  const handleSave = async () => {
    // Validation
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Please enter both title and content");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "You must be logged in to save journals");
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      Alert.alert("Error", "Authentication expired. Please log in again.");
      navigation.navigate('Login');
      return;
    }

    setSaving(true);

    try {
      const db = firestore();
      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      const journalData = {
        title: title.trim(),
        content: content.trim(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (editId !== null) {
        // UPDATE: Update existing journal
        const journalRef = db
          .collection('users')
          .doc(userId)
          .collection('journals')
          .doc(editId);
        
        const docSnapshot = await journalRef.get();
        if (!docSnapshot.exists) {
          throw new Error('Journal entry not found');
        }

        await journalRef.update(journalData);
      } else {
        // CREATE: Add new journal
        journalData.createdAt = firestore.FieldValue.serverTimestamp();
        
        await db
          .collection('users')
          .doc(userId)
          .collection('journals')
          .add(journalData);
        
        Alert.alert("Success", "Journal saved successfully!");
      }

      // Clear form and go back to list view
      setTitle("");
      setContent("");
      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving journal:', error);
      let errorMessage = 'Failed to save journal';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firestore is unavailable. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error Saving Journal", `${errorMessage}\n\nError Code: ${error.code || 'N/A'}`);
    } finally {
      setSaving(false);
    }
  };

  // READ & UPDATE: Load entry data for editing
  const handleEdit = (id) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setEditId(id);
      setShowForm(true);
    } else {
      Alert.alert("Error", "Journal entry not found");
    }
  };

  // Cancel form (go back to list)
  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setTitle("");
    setContent("");
  };

  // Show form for adding new journal
  const handleAddClick = () => {
    setEditId(null);
    setTitle("");
    setContent("");
    setShowForm(true);
  };

  // DELETE: Remove journal entry
  const handleDelete = (id) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const db = firestore();
              if (!db) {
                throw new Error('Firestore is not initialized');
              }

              const journalRef = db
                .collection('users')
                .doc(userId)
                .collection('journals')
                .doc(id);
              
              const docSnapshot = await journalRef.get();
              if (!docSnapshot.exists) {
                throw new Error('Journal entry not found');
              }

              await journalRef.delete();
            } catch (error) {
              console.error('Error deleting journal:', error);
              let errorMessage = 'Failed to delete journal';
              
              if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please check Firestore security rules.';
              } else if (error.code === 'unavailable') {
                errorMessage = 'Firestore is unavailable. Please check your connection.';
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              Alert.alert("Error", errorMessage);
            }
          }
        }
      ]
    );
  };

  // Filtered entries by search (search by title only, default shows all)
  const filteredEntries = searchTerm.trim() === '' 
    ? entries 
    : entries.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <View style={styles.container}>
      <View style={styles.journalCard}>
        {/* TOP BAR */}
        <View style={styles.journalsTopBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.backButtonText}>⬅ Home</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Journal Entries</Text>
        </View>

        {showForm ? (
          /* STEP 2: Entry Form (shown when Add or Edit is clicked) */
          <ScrollView style={styles.formScrollView}>
            <View style={styles.journalForm}>
              <Text style={styles.formTitle}>{editId !== null ? "Edit Journal" : "Add New Journal"}</Text>
              
              <TextInput
                style={styles.formInput}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.formTextarea}
                placeholder="Write your journal here..."
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
              
              <View style={styles.formButtonsRow}>
                <TouchableOpacity 
                  style={[styles.formButton, saving && styles.formButtonDisabled]} 
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.formButtonText}>{editId !== null ? "Update" : "Save"}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          /* STEP 1: List View (default view) */
          <>
            {/* Search */}
            <TextInput
              style={styles.journalSearch}
              placeholder="Search by title (leave empty to show all)..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddClick}>
              <Text style={styles.addButtonText}>+ Add Journal</Text>
            </TouchableOpacity>

            {/* Entries List */}
            <ScrollView style={styles.journalList} showsVerticalScrollIndicator={true}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#D6A84F" />
                  <Text style={styles.loadingText}>Loading journals...</Text>
                </View>
              ) : filteredEntries.length === 0 ? (
                <Text style={styles.noEntries}>
                  {searchTerm.trim() === '' ? "No entries yet. Click 'Add Journal' to create your first journal!" : "No entries found matching your search."}
                </Text>
              ) : (
                filteredEntries.map(entry => {
                  // Format date
                  const date = entry.createdAt?.toDate 
                    ? entry.createdAt.toDate().toLocaleString() 
                    : entry.updatedAt?.toDate 
                      ? entry.updatedAt.toDate().toLocaleString()
                      : 'Date not available';
                  
                  return (
                    <View key={entry.id} style={styles.journalEntry}>
                      <View style={styles.entryText}>
                        <Text style={styles.entryTitle}>{entry.title}</Text>
                        <Text style={styles.entryContent}>{entry.content}</Text>
                        <Text style={styles.entryDate}>{date}</Text>
                      </View>
                      <View style={styles.entryActions}>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(entry.id)}>
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(entry.id)}>
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

export default Journals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FAF7F2',
    padding: 20,
  },
  journalCard: {
    backgroundColor: 'white',
    width: '100%',
    flex: 1,
    padding: 20,
    borderRadius: 18,
    elevation: 5,
  },
  journalsTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    paddingHorizontal: 18,
    backgroundColor: '#D6A84F',
    borderRadius: 10,
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  journalSearch: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
  },
  journalForm: {
    marginBottom: 20,
  },
  formInput: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  formTextarea: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    height: 100,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  formButton: {
    backgroundColor: '#D6A84F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 2,
    minHeight: 50,
  },
  formButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    minHeight: 40,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formScrollView: {
    flex: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#3A3A3A',
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#D6A84F',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  journalList: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  journalEntry: {
    backgroundColor: '#FAF7F2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E2D6',
  },
  entryText: {
    marginBottom: 10,
    paddingRight: 10,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#3A3A3A',
  },
  entryContent: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  entryDate: {
    fontSize: 12,
    color: '#888',
  },
  entryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    padding: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#D6A84F',
    marginRight: 10,
  },
  editButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  deleteButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  noEntries: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
});