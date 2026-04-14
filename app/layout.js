export const metadata = {
	title: 'NEXUS-SOC | Incident #IR-2026-0420', // update this for due date
	description: 'Security Operations Center — Active Incident'
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body style={{ margin: 0, padding: 0, background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>{children}</body>
		</html>
	);
}
