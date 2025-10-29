import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { PropsWithChildren, ReactElement } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  style?: StyleProp<ViewStyle>
}>;

function AnimatedParallax({ children, headerImage, headerBackgroundColor, style }: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView ref={scrollRef} style={{ backgroundColor, flex: 1 }} scrollEventThrottle={16}>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
          style
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

function FallbackParallax({ children, headerImage, headerBackgroundColor }: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <ScrollView style={{ backgroundColor, flex: 1 }} scrollEventThrottle={16}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }]}>
        {headerImage}
      </View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </ScrollView>
  );
}

// Try to determine if Reanimated is available and functional
const isReanimatedAvailable = () => {
  try {
    return Animated !== undefined && 
           interpolate !== undefined && 
           useAnimatedRef !== undefined && 
           useAnimatedStyle !== undefined;
  } catch {
    return false;
  }
};

const ParallaxScrollView = isReanimatedAvailable() ? AnimatedParallax : FallbackParallax;
export default ParallaxScrollView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 0,
    gap: 16,
    overflow: 'hidden',
  },
});
