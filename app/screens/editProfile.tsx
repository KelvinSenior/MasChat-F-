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
  View
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateProfile, uploadImage, UserProfile } from '../lib/services/userService';

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
      icon: <Ionicons name="information-circle-outline" size={18} color="#222" />,
      placeholder: 'Select profile type',
      value: profileData.details.profileType ?? ''
    },
    {
      key: 'details.worksAt1',
      label: 'Workplace',
      icon: <MaterialIcons name="work-outline" size={18} color="#222" />,
      placeholder: 'Add workplace',
      value: profileData.details.worksAt1 ?? ''
    },
    {
      key: 'details.studiedAt',
      label: 'Education',
      icon: <FontAwesome5 name="university" size={16} color="#222" />,
      placeholder: 'Add education',
      value: profileData.details.studiedAt?? ''
    },
    {
      key: 'details.currentCity',
      label: 'Current City',
      icon: <Ionicons name="location-outline" size={18} color="#222" />,
      placeholder: 'Add current city',
      value: profileData.details.currentCity ?? ''
    },
    {
      key: 'details.relationshipStatus',
      label: 'Relationship',
      icon: <Ionicons name="heart-outline" size={18} color="#222" />,
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
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://192.168.255.125:8080${imageUrl}`;

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
    // Fetch latest profile and update context
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
            <TextInput
              style={[styles.detailText, styles.textInput]}
              value={tempValue}
              onChangeText={setTempValue}
              autoFocus
              placeholder={field.placeholder}
              placeholderTextColor="#888"
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={cancelEdit}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.detailTextContainer}>
            <Text style={[styles.detailText, !field.value && styles.placeholderText]}>
              {field.value || field.placeholder}
            </Text>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => startEditing(field.key, field.value)}
            >
              <Ionicons name="create-outline" size={16} color="#1877f2" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (!user) {
    return <View><Text>User not found</Text></View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={keyboardVisible ? styles.scrollViewContentKeyboardOpen : styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={['#1877f2', '#0a5bc4']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Picture */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle]}>
            Profile picture
            <TouchableOpacity onPress={() => pickImage('profilePicture')}>
              <Text style={styles.editLink}> Edit</Text>
            </TouchableOpacity>
          </Text>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileData.profilePicture }}
              style={styles.profilePic}
            />
          </View>
        </View>

        {/* Avatar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Avatar
            <TouchableOpacity onPress={() => setShowAvatarPicker(!showAvatarPicker)}>
              <Text style={styles.editLink}> {showAvatarPicker ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </Text>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileData.details.avatar }}
              style={styles.avatarImg}
            />
          </View>
          
          {showAvatarPicker && (
            <LinearGradient
              colors={['#fff', '#f8f9fa']}
              style={styles.avatarPickerContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarPickerTitle}>Choose an avatar</Text>
              <View style={styles.avatarOptions}>
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
                  >
                    <LinearGradient
                      colors={profileData.details.avatar === avatar ? ['#4facfe', '#00f2fe'] : ['#f5f7fa', '#e4e8f0']}
                      style={styles.avatarOptionContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Image 
                        source={{ uri: avatar }} 
                        style={styles.avatarOption}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                onPress={() => pickImage('avatar')}
                style={styles.customAvatarButton}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.customAvatarButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.customAvatarButtonText}>Upload Custom Avatar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>

        {/* Avatar Settings */}
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          style={styles.settingsSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Show Avatar</Text>
              <Text style={styles.settingDescription}>
                Display your avatar on your profile
              </Text>
            </View>
            <Switch
              value={profileData.details.showAvatar}
              onValueChange={toggleAvatarVisibility}
              thumbColor={profileData.details.showAvatar ? "#1877f2" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          {profileData.details.showAvatar && (
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Enable Swipe Effect</Text>
                <Text style={styles.settingDescription}>
                  Allow swiping profile picture to reveal avatar
                </Text>
              </View>
              <Switch
                value={profileData.details.avatarSwipeEnabled}
                onValueChange={toggleSwipeEffect}
                thumbColor={profileData.details.avatarSwipeEnabled ? "#1877f2" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
              />
            </View>
          )}
        </LinearGradient>

        {/* Cover Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Cover photo
            <TouchableOpacity onPress={() => pickImage('coverPhoto')}>
              <Text style={styles.editLink}> Edit</Text>
            </TouchableOpacity>
          </Text>
          <Image
            source={{ uri: profileData.coverPhoto }}
            style={styles.coverPhoto}
          />
        </View>

        {/* Bio */}
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          style={styles.section}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Bio</Text>
            {editingField === 'bio' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.textInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  multiline
                  autoFocus
                  placeholder="Tell people about yourself"
                  placeholderTextColor="#888"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={saveEdit} style={styles.doneButton}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => {
                setEditingField('bio');
                setTempValue(profileData.bio ?? '');
              }}>
                <Text style={[styles.bioText, !profileData.bio && styles.placeholderText]}>
                  {profileData.bio || "Tell people about yourself"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Details Section */}
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          style={styles.section}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
          </View>
          
          {detailFields.map(field => (
  <View key={field.key} style={styles.detailRow}>
    <Text style={styles.detailLabel}>{field.label}</Text>
    {editingField === field.key ? (
      <View style={styles.editContainer}>
        <TextInput
          style={styles.textInput}
          value={tempValue}
          onChangeText={setTempValue}
          autoFocus
          placeholder={field.placeholder}
          placeholderTextColor="#888"
        />
        <View style={styles.editActions}>
          <TouchableOpacity onPress={saveEdit} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <TouchableOpacity onPress={() => {
        setEditingField(field.key);
        setTempValue(field.value);
      }}>
        <Text style={[styles.detailText, !field.value && styles.placeholderText]}>
          {field.value || field.placeholder}
        </Text>
      </TouchableOpacity>
    )}
  </View>
))}
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  scrollViewContent: {
    paddingBottom: 20
  },
  scrollViewContentKeyboardOpen: {
    paddingBottom: 300
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#222",
    marginBottom: 12,
    fontFamily: 'sans-serif-medium'
  },
  editLink: {
    color: "#1877f2",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
    fontFamily: 'sans-serif-medium'
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  avatarImg: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  avatarPickerContainer: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    fontFamily: 'sans-serif-medium'
  },
  avatarOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOptionContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  avatarOption: {
    width: 66,
    height: 66,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white'
  },
  customAvatarButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  customAvatarButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  customAvatarButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium'
  },
  settingsSection: {
    borderRadius: 16,
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
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  settingLabel: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    fontFamily: 'sans-serif-medium'
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
    fontFamily: 'sans-serif'
  },
  coverPhoto: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: "#222",
    lineHeight: 20,
    fontFamily: 'sans-serif'
  },
  placeholderText: {
    color: "#888",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  detailTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#222",
    flex: 1,
    fontFamily: 'sans-serif'
  },
  editIcon: {
    marginLeft: 10,
  },
  editContainer: {
    flex: 1,
    marginLeft: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 15,
    color: '#222',
    fontFamily: 'sans-serif'
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  saveButton: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'sans-serif-medium'
  },
  cancelButton: {
    color: "#888",
    marginRight: 16,
    fontFamily: 'sans-serif-medium'
  },
  doneButton: {
    backgroundColor: '#1877f2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium'
  },
  detailLabel: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    fontFamily: 'sans-serif-medium',
    marginRight: 12,
    minWidth: 90,
  },
});