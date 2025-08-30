export default function Dice({
   onRoll,
   disabled,
}: {
   onRoll: () => void;
   disabled: boolean;
}) {
   return (
      <button
         onClick={onRoll}
         style={{ cursor: disabled ? 'default' : 'pointer', backgroundColor: '#f00' }}
      >
         Roll Dice
      </button>
   );
}
