import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authService } from '@/services/authService';
import { useToast } from '@/store/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator, Modal, Animated } from 'react-native';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    currentPassword?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.show('Đổi mật khẩu thành công', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setTouched({});
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      toast.show(errorMessage, 'error');
      if (errorMessage.includes('Mật khẩu hiện tại')) {
        setErrors({ currentPassword: errorMessage });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>Đổi mật khẩu</ThemedText>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View>
                <View style={[
                  styles.inputWrapper,
                  errors.currentPassword ? styles.inputWrapperError : null
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={errors.currentPassword ? "#ff3b30" : "#666"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Mật khẩu hiện tại"
                    placeholderTextColor="#999"
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      if (touched.currentPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          currentPassword: text.trim() ? '' : 'Mật khẩu hiện tại là bắt buộc',
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, currentPassword: true }));
                      setErrors((prev) => ({
                        ...prev,
                        currentPassword: currentPassword.trim() ? '' : 'Mật khẩu hiện tại là bắt buộc',
                      }));
                    }}
                    secureTextEntry={!showCurrentPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.passwordIcon}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}
              </View>

              <View>
                <View style={[
                  styles.inputWrapper,
                  errors.newPassword ? styles.inputWrapperError : null
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={errors.newPassword ? "#ff3b30" : "#666"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Mật khẩu mới"
                    placeholderTextColor="#999"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (touched.newPassword) {
                        let error = '';
                        if (!text) {
                          error = 'Mật khẩu mới là bắt buộc';
                        } else if (text.length < 6) {
                          error = 'Mật khẩu mới phải có ít nhất 6 ký tự';
                        }
                        setErrors((prev) => ({ ...prev, newPassword: error }));
                      }
                      if (touched.confirmPassword && confirmPassword && text !== confirmPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: 'Mật khẩu xác nhận không khớp',
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, newPassword: true }));
                      let error = '';
                      if (!newPassword) {
                        error = 'Mật khẩu mới là bắt buộc';
                      } else if (newPassword.length < 6) {
                        error = 'Mật khẩu mới phải có ít nhất 6 ký tự';
                      }
                      setErrors((prev) => ({ ...prev, newPassword: error }));
                    }}
                    secureTextEntry={!showNewPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.passwordIcon}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>

              <View>
                <View style={[
                  styles.inputWrapper,
                  errors.confirmPassword ? styles.inputWrapperError : null
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={errors.confirmPassword ? "#ff3b30" : "#666"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Xác nhận mật khẩu mới"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (touched.confirmPassword) {
                        let error = '';
                        if (!text) {
                          error = 'Xác nhận mật khẩu là bắt buộc';
                        } else if (text !== newPassword) {
                          error = 'Mật khẩu xác nhận không khớp';
                        }
                        setErrors((prev) => ({ ...prev, confirmPassword: error }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, confirmPassword: true }));
                      let error = '';
                      if (!confirmPassword) {
                        error = 'Xác nhận mật khẩu là bắt buộc';
                      } else if (confirmPassword !== newPassword) {
                        error = 'Mật khẩu xác nhận không khớp';
                      }
                      setErrors((prev) => ({ ...prev, confirmPassword: error }));
                    }}
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  activeOpacity={0.8}
                  disabled={changingPassword}
                >
                  <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleChangePassword}
                  activeOpacity={0.8}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="lock-closed" size={20} color="#fff" style={styles.buttonIcon} />
                      <ThemedText style={styles.submitButtonText}>Đổi mật khẩu</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 52,
  },
  inputWrapperError: {
    borderColor: '#ff3b30',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  passwordIcon: {
    padding: 8,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

