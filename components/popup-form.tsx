import { useCreateUser } from '@/hooks/use-user-service';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PopupFormProps {
    visible: boolean;
    onClose: () => void;
  }
  
export function PopupForm({ visible, onClose }: PopupFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const {createUser, loading} = useCreateUser()

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
    let path
    if (image) {
      path = await uploadImageToCloudinary(image);
    }

    const newUser = {
      username,
      email,
      password, 
      image: path ?? "",
    }
    await createUser(newUser)

    setUsername('')
    setEmail('')
    setPassword('')
    setImage(null)

    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.popup}>
      <View style={styles.modalView}>
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
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Text>{image ? 'Thay đổi ảnh' : 'Thêm ảnh'}</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Text style={styles.buttonText}>Lưu</Text>
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