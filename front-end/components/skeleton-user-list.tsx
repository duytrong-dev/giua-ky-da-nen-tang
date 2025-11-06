import { StyleSheet, View } from 'react-native';

const SkeletonUserList = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 10 }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonText} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
    gap: 12
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    width: '100%'
  },
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  skeletonText: {
    flex: 1,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
});

export default SkeletonUserList;