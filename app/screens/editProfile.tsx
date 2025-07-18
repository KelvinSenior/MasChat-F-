import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateProfile, uploadImage, UserProfile } from '../lib/services/userService';
import client, { BASE_URL } from '../api/client';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const DEFAULT_PROFILE_PIC = "https://randomuser.me/api/portraits/men/1.jpg";
const DEFAULT_COVER_PHOTO = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
const DEFAULT_AVATARS = [
  'https://i.imgur.com/6XbK6bE.jpg',
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
];

type DetailField = {
  key: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
};

export default function EditProfile() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    id: user?.id ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    fullName: user?.fullName ?? "",
    profilePicture: user?.profilePicture ?? DEFAULT_PROFILE_PIC,
    coverPhoto: user?.coverPhoto ?? DEFAULT_COVER_PHOTO,
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? user?.details?.avatar ?? DEFAULT_PROFILE_PIC,
    details: {
      profileType: user?.details?.profileType ?? "",
      worksAt1: user?.details?.worksAt1 ?? "",
      worksAt2: user?.details?.worksAt2 ?? "",
      studiedAt: user?.details?.studiedAt ?? "",
      wentTo: user?.details?.wentTo ?? "",
      currentCity: user?.details?.currentCity ?? "",
      hometown: user?.details?.hometown ?? "",
      relationshipStatus: user?.details?.relationshipStatus ?? "",
      showAvatar: user?.details?.showAvatar ?? false,
      avatar: user?.details?.avatar ?? DEFAULT_PROFILE_PIC,
      avatarSwipeEnabled: user?.details?.avatarSwipeEnabled ?? false,
      followerCount: user?.details?.followerCount ?? 0,
      followingCount: user?.details?.followingCount ?? 0,
    },
    verified: user?.verified ?? false,
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const detailFields: DetailField[] = [
    {
      key: 'details.profileType',
      label: 'Profile Type',
      icon: <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />,
      placeholder: 'Select profile type',
      value: profileData.details.profileType ?? ''
    },
    {
      key: 'details.worksAt1',
      label: 'Workplace',
      icon: <MaterialIcons name="work-outline" size={20} color={COLORS.primary} />,
      placeholder: 'Add workplace',
      value: profileData.details.worksAt1 ?? ''
    },
    {
      key: 'details.studiedAt',
      label: 'Education',
      icon: <FontAwesome5 name="university" size={18} color={COLORS.primary} />,
      placeholder: 'Add education',
      value: profileData.details.studiedAt ?? ''
    },
    {
      key: 'details.currentCity',
      label: 'Current City',
      icon: <Ionicons name="location-outline" size={20} color={COLORS.primary} />,
      placeholder: 'Add current city',
      value: profileData.details.currentCity ?? ''
    },
    {
      key: 'details.relationshipStatus',
      label: 'Relationship',
      icon: <Ionicons name="heart-outline" size={20} color={COLORS.primary} />,
      placeholder: 'Add relationship status',
      value: profileData.details.relationshipStatus ?? ''
    }
  ];

  const pickImage = async (field: 'profilePicture' | 'avatar' | 'coverPhoto') => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'coverPhoto' ? [3, 1] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && user?.id) {
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        let imageUrl;
        if (field === 'avatar') {
          imageUrl = await uploadImage(manipResult.uri, field, user.id, profileData.details.showAvatar);
        } else {
          imageUrl = await uploadImage(manipResult.uri, field, user.id);
        }
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;

        const updatePayload: any = field === 'avatar'
          ? { details: { ...profileData.details, avatar: fullImageUrl } }
          : { [field]: fullImageUrl };

        const updatedUser = await updateProfile(user.id, updatePayload);
        setProfileData(prev => ({
          ...prev,
          ...(field !== 'avatar' && { [field]: fullImageUrl }),
          details: field === 'avatar'
            ? { ...prev.details, avatar: fullImageUrl }
            : prev.details,
        }));

        await updateUser(updatedUser);
        Alert.alert('Success', `${field} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Alert.alert('Error', `Failed to update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updateData = {
        bio: profileData.bio,
        fullName: profileData.fullName,
        details: { ...profileData.details }
      };
      await updateProfile(user.id, updateData);
      const refreshed = await getUserProfile(user.id);
      await updateUser(refreshed);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvatarVisibility = (val: boolean) => {
    setProfileData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        showAvatar: val,
        avatarSwipeEnabled: val ? prev.details.avatarSwipeEnabled : false
      }
    }));
  };

  const toggleSwipeEffect = (val: boolean) => {
    setProfileData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        avatarSwipeEnabled: val
      }
    }));
  };

  const startEditing = (field: string, currentValue: string = '') => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = async () => {
    if (!editingField || !user?.id) return;
    setLoading(true);
    try {
      if (editingField.includes('.')) {
        const [parent, child] = editingField.split('.');
        const updatedUser = await updateProfile(user.id, {
          details: {
            ...profileData.details,
            [child]: tempValue
          }
        });
        setProfileData(prev => ({
          ...prev,
          details: {
            ...prev.details,
            [child]: tempValue
          }
        }));
        await updateUser(updatedUser);
      } else {
        const updatedUser = await updateProfile(user.id, {
          [editingField]: tempValue,
          details: { ...profileData.details }
        });
        setProfileData(prev => ({
          ...prev,
          [editingField]: tempValue
        }));
        await updateUser(updatedUser);
      }
      setEditingField(null);
      Keyboard.dismiss();
      Alert.alert('Success', 'Changes saved successfully');
    } catch (error) {
      console.error('Error saving edit:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    Keyboard.dismiss();
  };

  const renderDetailField = (field: DetailField) => {
    const isEditing = editingField === field.key;
    
    return (
      <View key={field.key} style={styles.detailRow}>
        {field.icon}
        {isEditing ? (
          <View style={styles.editContainer}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={tempValue}
                onChangeText={setTempValue}
                autoFocus
                placeholder={field.placeholder}
                placeholderTextColor={COLORS.lightText}
              />
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.detailTextContainer}
            onPress={() => startEditing(field.key, field.value)}
          >
            <Text style={[styles.detailText, !field.value && styles.placeholderText]}>
              {field.value || field.placeholder}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, '#1A4B8C']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButtonHeader}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonTextHeader}>Save</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Picture */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <TouchableOpacity onPress={() => pickImage('profilePicture')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileData.profilePicture }}
              style={styles.profilePic}
            />
          </View>
        </View>

        {/* Avatar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avatar</Text>
            <TouchableOpacity onPress={() => setShowAvatarPicker(!showAvatarPicker)}>
              <Text style={styles.editLink}>{showAvatarPicker ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileData.details.avatar }}
              style={styles.avatarImg}
            />
          </View>
          
          {showAvatarPicker && (
            <View style={styles.avatarPickerContainer}>
              <Text style={styles.avatarPickerTitle}>Choose an avatar</Text>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarOptions}
              >
                {DEFAULT_AVATARS.map((avatar) => (
                  <TouchableOpacity 
                    key={avatar} 
                    onPress={async () => {
                      if (!user) return;
                      try {
                        setLoading(true);
                        await updateProfile(user.id, {
                          details: {
                            ...profileData.details,
                            avatar: avatar
                          }
                        });
                        const refreshed = await getUserProfile(user.id);
                        setProfileData(prev => ({
                          ...prev,
                          details: {
                            ...prev.details,
                            avatar: avatar
                          }
                        }));
                        await updateUser(refreshed);
                        setShowAvatarPicker(false);
                        Alert.alert('Success', 'Avatar updated successfully');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    style={[
                      styles.avatarOptionContainer,
                      profileData.details.avatar === avatar && styles.selectedAvatar
                    ]}
                  >
                    <Image 
                      source={{ uri: avatar }} 
                      style={styles.avatarOption}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity 
                onPress={() => pickImage('avatar')}
                style={styles.customAvatarButton}
              >
                <Text style={styles.customAvatarButtonText}>Upload Custom Avatar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Avatar Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Show Avatar</Text>
              <Text style={styles.settingDescription}>
                Display your avatar on your profile
              </Text>
            </View>
            <Switch
              value={profileData.details.showAvatar}
              onValueChange={toggleAvatarVisibility}
              thumbColor={profileData.details.showAvatar ? COLORS.primary : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          {profileData.details.showAvatar && (
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Enable Swipe Effect</Text>
                <Text style={styles.settingDescription}>
                  Allow swiping profile picture to reveal avatar
                </Text>
              </View>
              <Switch
                value={profileData.details.avatarSwipeEnabled}
                onValueChange={toggleSwipeEffect}
                thumbColor={profileData.details.avatarSwipeEnabled ? COLORS.primary : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
              />
            </View>
          )}
        </View>

        {/* Cover Photo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cover Photo</Text>
            <TouchableOpacity onPress={() => pickImage('coverPhoto')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: profileData.coverPhoto }}
            style={styles.coverPhoto}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {editingField === 'bio' ? (
            <View style={styles.bioEditContainer}>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={tempValue}
                onChangeText={setTempValue}
                multiline
                autoFocus
                placeholder="Tell people about yourself"
                placeholderTextColor={COLORS.lightText}
              />
              <View style={styles.bioEditButtons}>
                <TouchableOpacity onPress={cancelEdit} style={styles.bioCancelButton}>
                  <Text style={styles.bioButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit} style={styles.bioSaveButton}>
                  <Text style={styles.bioButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => {
                setEditingField('bio');
                setTempValue(profileData.bio ?? '');
              }}
              style={styles.bioTextContainer}
            >
              <Text style={[styles.bioText, !profileData.bio && styles.placeholderText]}>
                {profileData.bio || "Tell people about yourself"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          {detailFields.map(renderDetailField)}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: 'center',
  },
  saveButtonHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonTextHeader: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  editLink: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarImg: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarPickerContainer: {
    marginTop: 12,
  },
  avatarPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  avatarOptions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  avatarOptionContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: COLORS.primary,
  },
  avatarOption: {
    width: '100%',
    height: '100%',
  },
  customAvatarButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  customAvatarButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
  },
  coverPhoto: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  detailTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.lightText,
  },
  editContainer: {
    flex: 1,
  },
  textInputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    paddingRight: 120, // Space for buttons
  },
  editButtonsContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#e4e6eb',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bioEditContainer: {
    marginTop: 8,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioEditButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  bioCancelButton: {
    backgroundColor: '#e4e6eb',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bioSaveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bioButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bioTextContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  bioText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
});