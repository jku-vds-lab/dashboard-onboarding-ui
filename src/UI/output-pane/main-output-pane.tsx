import React, { useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Onboarding from "../../pages/onboarding";
import "../assets/css/dashboard.scss";
import * as global from "../../onboarding/ts/globalVariables";
import {
  ResizeContent,
  ResizeHandleLeft,
  ResizePanel,
} from "react-hook-resize-panel";
import OutputView from "../../pages/outputView";
import {
  reloadOnboarding,
  startOnboardingAt,
} from "../../onboarding/ts/onboarding";
import UserLevel from "./userLevel";

// redux starts
import type { RootState } from "../redux/store";
import { useSelector } from "react-redux";
// redux ends

export default function OutputPane() {
  // redux starts
  const nodeBasicName = useSelector(
    (state: RootState) => state.nodeModal.basicName
  );
  const nodeFullName = useSelector(
    (state: RootState) => state.nodeModal.fullName
  );
  const expertiseLevel = useSelector((state: RootState) => state.expertise);
  // redux  ends

  useEffect(() => {
    if (nodeBasicName && expertiseLevel) {
      let visual = undefined;
      let visualName = "";
      let category: string[];
      let count: number;
      nodeFullName
      switch(nodeBasicName){
        case "dashboard":
        case "globalFilter":
          visualName = nodeBasicName;
          break;
        default:
          visual = global.allVisuals.find((visual) => {
            return visual.name == nodeBasicName;
          });
    
          if (!visual) {
            return;
          }
    
          visualName = "visual";
      }

      if(nodeFullName.length > 3){
        category = [nodeFullName[1]];
        count = parseInt(nodeFullName[2]);
      }else{
        category = ["general"]
        count = parseInt(nodeFullName[1]);
      }

      startOnboardingAt(visualName, visual, category, count, expertiseLevel, true);
    }
  }, [nodeBasicName, nodeFullName, expertiseLevel]);

  return (
    <ResizePanel initialWidth={600} maxWidth={800} minWidth={400}>
      <ResizeHandleLeft
        className="resize"
        onClick={() => reloadOnboarding(false)}
      >
        <div className="col-resize" />
      </ResizeHandleLeft>
      <ResizeContent>
        <div id="outputView">
          <div className="label">Output View</div>
          <div
            id="outputView"
            style={{ color: "black", backgroundColor: "white" }}
          >
            <OutputView />
          </div>
        </div>
        <div id="userLevel">
          <div className="label">User Level</div>
          <div id="userMatrix">
            <UserLevel />
          </div>
        </div>
      </ResizeContent>
    </ResizePanel>
  );
}
