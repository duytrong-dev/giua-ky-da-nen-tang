import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import { useGetUserById, useUpdateUser } from '@/hooks/use-user-service';
import { useAuth } from '@/store/AuthContext';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function SettingScreen() {

  const { user, updateCurrentUser } = useAuth();
  const { updateUser } = useUpdateUser();
  const { fetchUserById, user: fetchedUser } = useGetUserById();
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [image, setImage] = useState(user?.image);

  const handleUpdate = async () => {
    if (!user?.id) return;

    await updateUser(user.id, { email, username });
    await fetchUserById(user.id);
    if (fetchedUser) {
      await updateCurrentUser(fetchedUser);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
      await updateUser(user?.id as string, { image });
      await fetchUserById(user?.id as string);
      if (fetchedUser) {
        await updateCurrentUser(fetchedUser);
      }
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#61DAFB', dark: '#61DAFB' }}
      headerImage={
        <TouchableOpacity style={styles.headerImageContainer} onPress={pickImage}>
          <Image
            source={image ? { uri: image } : require('@/assets/images/avatar.png')}
            style={styles.headerImage}
          />
        </TouchableOpacity>
      }
    >
      <ThemedView style={styles.userDetailsContainer}>
          <>
          <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Cập nhật</Text>
            </TouchableOpacity>
          </>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  updateButton: {
    marginTop: 20,
    backgroundColor: '#61DAFB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%'
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    padding: 10,
  },
  userDetailsContainer: {
    padding: 10,
    alignItems: 'center',
  },
  headerImageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#61DAFB',
  },
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    zIndex: 1000,
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: [{ translateX: -60 }],
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
