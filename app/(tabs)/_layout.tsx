import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 20, marginBottom: -3 }}>{label}</Text>;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Settings',
          tabBarIcon: () => <TabBarIcon label="⚙️" />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Table',
          tabBarIcon: () => <TabBarIcon label="📋" />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: () => <TabBarIcon label="🗓️" />,
        }}
      />
    </Tabs>
  );
}
