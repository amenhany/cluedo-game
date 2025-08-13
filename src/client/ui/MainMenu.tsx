import '../assets/css/menu.css';
// import background from '../assets/images/menu.webp';

export default function MainMenu() {
   return (
      <div className="menu">
         {/* <img src={background} alt="Main Menu Background" /> */}
         <div className="button-container">
            <button>
               <p>Host Game</p>
            </button>
            <button>
               <p>Join Game</p>
            </button>
         </div>
      </div>
   );
}
