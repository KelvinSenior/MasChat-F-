import { Redirect } from 'expo-router';
import React from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

export default function Index() {
  return (
    <>
      <Redirect href="/(auth)/login" />
      <Toast />
    </>
  )
}