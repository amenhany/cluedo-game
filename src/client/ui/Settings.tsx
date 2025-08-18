import Modal from './Modal';

export default function Settings({ onClose }: { onClose: () => void }) {
   return (
      <Modal onClose={onClose} title="Settings">
         <ul>
            <li>Master Volume</li>
         </ul>
      </Modal>
   );
}
