import { Image, ImageProps } from 'expo-image';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingImageProps extends Omit<ImageProps, 'placeholder' | 'contentFit'> {
  placeholder?: ImageProps['placeholder'];
  showLoadingIndicator?: boolean;
  contentFit?: 'cover' | 'contain' | 'fill' | 'scaleDown' | 'none';
}

/**
 * Component Image với loading indicator và transition mượt mà
 * Tự động hiển thị loading indicator khi đang tải ảnh
 */
export function LoadingImage({ 
  style, 
  showLoadingIndicator = true,
  placeholder,
  contentFit = 'cover',
  source,
  ...props 
}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const defaultPlaceholder = placeholder || require('@/assets/images/avatar.png');

  // Reset loading state khi source thay đổi
  useEffect(() => {
    setIsLoading(true);
  }, [source]);

  return (
    <View style={[style, styles.container]}>
      <Image
        {...props}
        style={StyleSheet.absoluteFill}
        placeholder={defaultPlaceholder}
        contentFit={contentFit}
        transition={200}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      {isLoading && showLoadingIndicator && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#61DAFB" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

