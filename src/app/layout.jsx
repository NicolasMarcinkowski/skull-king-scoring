import '../styles/base.css';
import '../styles/controls.css';

export const metadata = {
  title: 'Skull King — Le journal des mers',
  description: 'Votre journal de bord Skull King. Comptez les points, les plis et les bonus de votre équipage.',
};

export const viewport = { themeColor: '#0b141b' };

export default function RootLayout({ children }) {
  return <html lang="fr"><body>{children}</body></html>;
}
