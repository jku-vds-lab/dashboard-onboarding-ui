import { Link } from "react-router-dom";
import * as global from "../onboarding/ts/globalVariables";
import MyReport from "./report";

export default function Onboarding() {
  return (
    // <MyReport isMainPage={true} />
    <div className="container-fluid" id="flexContainer">
      <div className="row" id="onboarding-header">
        <Link
          to="/editor"
          id="editOnboarding"
          className="col-2"
          style={{ margin: "10px", padding: "0px" }}
          hidden
        >
          <button
            id="editButton"
            type="button"
            className={`onboardingButton + ${global.darkOutlineButtonClass}`}
            style={{ width: "100%" }}
          >
            Edit Dashboard Onboarding
          </button>
        </Link>
        <div className="row">
          <div className="col-10" id="reportContainer">
            <MyReport isMainPage={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
