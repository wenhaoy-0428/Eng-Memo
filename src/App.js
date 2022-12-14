import InputForm from "./components/input-container/InputForm";
import { NavBar, NavItem } from "./components/nav-bar/NavBar";

function App() {
  return (
    <div className="App flex flex-col justify-start gap-y-60 items-center h-screen">
      <NavBar>
        {/* <NavItem label="Review" icon={<TodayIcon />}></NavItem> */}
      </NavBar>
      <InputForm />
    </div>
  );
}

export default App;
