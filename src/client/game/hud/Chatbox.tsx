import type { PlayerState } from '@/types/game';
import type { ChatMessage, PlayerID } from 'boardgame.io';
import { SendHorizonal } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import selectSfx from '@/assets/audio/sfx/select.wav';
import cardSelectSfx from '@/assets/audio/sfx/card_select.wav';
import { AudioManager } from '@/lib/AudioManager';
import { motion } from 'motion/react';
import { SUSPECT_COLORS } from '@/game/constants';

export default function Chatbox({
   chat,
   players,
}: {
   players: Record<PlayerID, PlayerState>;
   chat: {
      messages: ChatMessage[];
      send: (message: any) => void;
   };
}) {
   const [expanded, setExpanded] = useState(false);
   const [message, setMessage] = useState('');
   const chatListRef = useRef<HTMLUListElement>(null);

   // auto-scroll when messages change
   useEffect(() => {
      const ul = chatListRef.current;
      if (ul) {
         ul.scrollTop = ul.scrollHeight;
      }
   }, [chat.messages]);

   return (
      <label
         className={`chat-box ${expanded ? 'expanded' : ''}`}
         htmlFor="chat"
         onFocus={() => {
            setExpanded(true);
         }}
         onBlur={() => setExpanded(false)}
      >
         <motion.ul
            ref={chatListRef}
            initial={{ height: 0 }}
            animate={{ height: expanded ? '200px' : 0 }}
         >
            {chat.messages.map((msg, idx) => (
               <li key={idx}>
                  <span style={{ color: SUSPECT_COLORS[players[msg.sender].character] }}>
                     {players[msg.sender].name}
                  </span>
                  : {msg.payload}
               </li>
            ))}
         </motion.ul>
         {expanded && <hr />}
         <form
            className="chat-input"
            onSubmit={(e) => {
               e.preventDefault();
               if (!message.trim()) return;
               chat.send(message);
               setMessage('');
               AudioManager.getInstance().playSfx(selectSfx);
            }}
         >
            <input
               name="chat"
               id="chat"
               onFocus={() => {
                  AudioManager.getInstance().playSfx(cardSelectSfx);
               }}
               value={message}
               onChange={(evt) => setMessage(evt.target.value)}
               placeholder="Type in the chat..."
            />
            <button type="submit">
               <SendHorizonal />
            </button>
         </form>
      </label>
   );
}
