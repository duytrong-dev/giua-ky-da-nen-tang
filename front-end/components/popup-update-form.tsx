import { User } from '@/constants/user';
import { useUpdateUser } from '@/hooks/use-user-service';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PopupFormProps {
    visible: boolean;
    onClose: () => void;
    user?: User
  }
  
export function PopupUpdateForm({ visible, onClose, user }: PopupFormProps) {
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [image, setImage] = useState(user?.image);
  const router = useRouter();

  const {updateUser} = useUpdateUser()

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    await updateUser(user?.id as string, {email: email, username: username , image: image, password: user?.password})
    router.replace(`/users/${user?.id}`)
    onClose()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.popup}>
      <View style={styles.modalView}>
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Text>{image ? 'Thay đổi ảnh' : 'Cập nhật ảnh'}</Text>
        </TouchableOpacity>
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
        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Text style={styles.buttonText}>Cập nhật</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
          <Text style={styles.buttonText}>Hủy bỏ</Text>
        </TouchableOpacity>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  popup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 20,
    backgroundColor: 'rgba(204, 204, 204, 0.8)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: 'auto'
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
  imagePicker: {
    marginBottom: 15,
  },
  previewImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#61DAFB',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});