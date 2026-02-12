export const metadata = {
  title: 'VeillePI Pro - Veille Média & LinkedIn',
  description: 'Application de veille automatique sur la propriété intellectuelle et la contrefaçon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
