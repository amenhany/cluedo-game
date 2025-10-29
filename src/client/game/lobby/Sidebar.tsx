import { AudioManager } from '@/lib/AudioManager';
import Backdrop from '@/ui/Backdrop';
import SettingsScreen from '@/ui/SettingsScreen';
import { DoorClosed, DoorOpen, Menu, Settings, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import modalOpen from '@/assets/audio/sfx/modal_open.wav';
import selectSfx from '@/assets/audio/sfx/select.wav';
import '@/assets/styles/sidebar.scss';
import { t } from '@/lib/lang';

export default function Sidebar({
   exitFn,
   players,
   playerID,
}: {
   exitFn: () => void;
   players: { id: number; name?: string }[];
   playerID?: string;
}) {
   const [sidebarVisible, setSidebarVisible] = useState(false);
   const [playerListExpanded, setPlayerListExpanded] = useState(true);
   const [openSettings, setOpenSettings] = useState(false);
   const [buttonHover, setButtonHover] = useState([false, false]);

   useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
         if (e.key === 'Escape') setSidebarVisible((prev) => !prev);
      }

      if (!openSettings) document.addEventListener('keydown', handleKeyDown);
      else document.removeEventListener('keydown', handleKeyDown);

      return () => document.removeEventListener('keydown', handleKeyDown);
   }, [setSidebarVisible, openSettings]);

   return (
      <>
         <button
            onClick={() => setSidebarVisible((prev) => !prev)}
            className="sidebar-button no-scroll-zone"
         >
            <Menu size={30} />
         </button>
         <AnimatePresence>
            {sidebarVisible && (
               <Backdrop onClick={() => setSidebarVisible(false)}>
                  <motion.div
                     className="sidebar no-scroll-zone"
                     onClick={(e) => e.stopPropagation()}
                     initial={{ right: '-200px' }}
                     animate={{ right: 0 }}
                     exit={{ right: '-200px' }}
                     transition={{ ease: 'easeInOut', duration: 0.3 }}
                  >
                     <h1 className="title">{t('hud.sidebar.title')}</h1>
                     <ul>
                        <div className="top-section">
                           <li>
                              <button
                                 onClick={() => {
                                    AudioManager.getInstance().playSfx(selectSfx);
                                    setPlayerListExpanded((prev) => !prev);
                                 }}
                              >
                                 <div className="header">
                                    <User /> {t('hud.sidebar.player_list')}
                                 </div>
                                 {playerListExpanded && (
                                    <ul
                                       className="player-list"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                       {players.map((p) => {
                                          if (p.name)
                                             return (
                                                <li
                                                   key={p.id}
                                                   className={
                                                      p.id.toString() === playerID
                                                         ? 'highlighted'
                                                         : ''
                                                   }
                                                >
                                                   {p.name}
                                                </li>
                                             );
                                       })}
                                    </ul>
                                 )}
                              </button>
                           </li>
                        </div>
                        <div className="bottom-section">
                           <li>
                              <button
                                 className="header"
                                 onClick={() => {
                                    setSidebarVisible(false);
                                    setOpenSettings(true);
                                    AudioManager.getInstance().playSfx(modalOpen);
                                 }}
                              >
                                 <Settings /> {t('hud.sidebar.settings')}
                              </button>
                           </li>
                           <li>
                              <button
                                 onClick={exitFn}
                                 className="header"
                                 onMouseEnter={() => setButtonHover([true, false])}
                                 onMouseLeave={() => setButtonHover([false, false])}
                              >
                                 {buttonHover[0] ? <DoorOpen /> : <DoorClosed />}{' '}
                                 {t('hud.sidebar.main_menu')}
                              </button>
                           </li>
                           <li>
                              <button
                                 className="header"
                                 onClick={() => {
                                    AudioManager.getInstance().playSfx(selectSfx);
                                    setTimeout(close, 100);
                                 }}
                                 onMouseEnter={() => setButtonHover([false, true])}
                                 onMouseLeave={() => setButtonHover([false, false])}
                              >
                                 {buttonHover[1] ? <DoorOpen /> : <DoorClosed />}{' '}
                                 {t('hud.sidebar.exit')}
                              </button>
                           </li>
                        </div>
                     </ul>
                  </motion.div>
               </Backdrop>
            )}

            {openSettings && <SettingsScreen onClose={() => setOpenSettings(false)} />}
         </AnimatePresence>
      </>
   );
}
