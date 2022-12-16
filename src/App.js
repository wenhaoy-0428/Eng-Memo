import InputForm from "./components/input-container/InputForm";
import NavBarTop from "./components/nav-bar/NavBar-Top";
import NavBarBottom from "./components/nav-bar/NavBar-Bottom";

function App() {
  return (
    <div className="App grid grid-rows-6 grid-flow-col items-start justify-items-center h-screen">
      <NavBarTop>
        {/* <NavItem label="Review" icon={<TodayIcon />}></NavItem> */}
      </NavBarTop>
      <InputForm />
      <NavBarBottom />
    </div>
  );
}

export default App;
