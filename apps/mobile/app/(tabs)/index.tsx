/** @format */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useState } from 'react';

export default function HomeScreen() {
	const [count, setCount] = useState(0);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>My First Screen</Text>

			<Text style={styles.counter}>Count: {count}</Text>

			<Pressable style={styles.button} onPress={() => setCount(count + 1)}>
				<Text style={styles.buttonText}>Increase</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0f172a',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},

	title: {
		fontSize: 28,
		fontWeight: '600',
		color: '#ffffff',
		marginBottom: 20,
	},

	counter: {
		fontSize: 20,
		color: '#e2e8f0',
		marginBottom: 20,
	},

	button: {
		backgroundColor: '#2563eb',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
	},

	buttonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '500',
	},
});
