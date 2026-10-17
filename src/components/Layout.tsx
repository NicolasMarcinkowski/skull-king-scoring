import type { ReactNode } from 'react';
import { Crown } from './ui.tsx';
import type { Screen } from '../domain/types.ts';

type LayoutProps = {
  screen: Screen;
  saved: boolean;
  navigate: (screen: Screen) => void;
  showRules: () => void;
  children: ReactNode;
};

export default function Layout({ screen, saved, navigate, showRules, children }: LayoutProps) {
  return <><header><div className="shell header-inner"><button className="brand" onClick={() => navigate('home')} aria-label="Skull King — Accueil"><Crown /><span><strong>SKULL KING</strong><small>Le journal des mers</small></span></button><nav aria-label="Navigation principale"><button className={`nav ${screen === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>Accueil</button><button className={`nav ${screen === 'history' ? 'active' : ''}`} onClick={() => navigate('history')}>Journal de bord</button><button className="nav" onClick={showRules} aria-label="Règles de comptage">?</button></nav></div></header>{children}<footer><div className="shell footer-inner"><span>SKULL KING · LE JOURNAL DES MERS</span><span className="saved" role="status" style={saved ? undefined : { color: 'var(--red)' }}>{saved ? 'Enregistré sur cet appareil' : 'Sauvegarde indisponible — gardez cette page ouverte'}</span><span>Score classique · Sans compte</span></div></footer></>;
}
