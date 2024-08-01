export function HelloPage({ isMinor }: { isMinor: boolean }) {
	return (
		<html>
			<body>
				<h1>{isMinor ? "Hello boy" : "Hello adult"}</h1>
			</body>
		</html>
	);
}
