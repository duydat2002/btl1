import {StyleSheet} from 'react-native';
import {EFontSize, EFontWeight} from '@/theme';

export const common = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },

  // Title
  title: {
    fontSize: EFontSize['4xl'],
    fontWeight: EFontWeight.semibold,
  },
  subTitle: {
    fontSize: EFontSize.lg,
    fontWeight: EFontWeight.semibold,
  },
  text: {
    fontSize: EFontSize.base,
  },
  medium: {
    fontSize: 14,
  },
  small: {
    fontSize: EFontSize.xs,
  },

  // Button
  buttonText: {
    fontSize: EFontSize.base,
    lineHeight: 24,
  },
  buttonIcon: {
    width: 24,
    height: 24,
  },

  // Shadow
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
});
