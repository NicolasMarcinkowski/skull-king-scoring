import type { ReactNode } from 'react';
import { Crown } from './ui.tsx';
import type { Screen } from '../domain/types.ts';

type LayoutProps = {
  screen: Screen;
  saved: boolean;
  navigate: (screen: Screen) => void;
  showRules: () => void;
  showRanking: () => void;
  rankingAvailable: boolean;
  children: ReactNode;
};

export default function Layout({ screen, saved, navigate, showRules, showRanking, rankingAvailable, children }: LayoutProps) {
  return <>
    <header><div className="shell header-inner">
      <button className="brand" onClick={() => navigate('home')} aria-label="Skull King — Accueil"><Crown /><span><strong>SKULL KING</strong><small>Le journal des mers</small></span></button>
      <button className="nav header-help" onClick={showRules} aria-label="Règles de comptage">?</button>
    </div></header>
    {children}
    <footer><div className="shell footer-inner"><span>SKULL KING · LE JOURNAL DES MERS</span><span className="saved" role="status" style={saved ? undefined : { color: 'var(--red)' }}>{saved ? 'Enregistré sur cet appareil' : 'Sauvegarde indisponible — gardez cette page ouverte'}</span><span>Score classique · Sans compte</span></div></footer>
    <nav className="bottom-nav" aria-label="Navigation principale">
      <button className={`nav ${screen === 'home' ? 'active' : ''}`} aria-current={screen === 'home' ? 'page' : undefined} onClick={() => navigate('home')}>Accueil</button>
      <button className={`nav ${screen === 'sheet' ? 'active' : ''}`} aria-current={screen === 'sheet' ? 'page' : undefined} disabled={!rankingAvailable} onClick={showRanking}>Classement</button>
    </nav>
  </>;
}
