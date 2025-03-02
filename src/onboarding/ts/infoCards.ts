import * as helpers from "./helperFunctions";
import * as global from "./globalVariables";
import * as elements from "./elements";
import * as disable from "./disableArea";
import { createVisualInfo } from "./visualInfo";
import {
  createInformationCard,
  createLookedAtIds,
  currentId,
  getCurrentTraversalElementType,
  groupType,
  isGroup,
  lookedAtInGroup,
  setCurrentId,
  setTraversalInGroupIndex,
  setVisualInGroupIndex,
  TraversalElement,
  traversalInGroupIndex,
  updateLookedAt,
  visualInGroupIndex,
} from "./traversal";

import { VisualDescriptor } from "powerbi-client";
import { getDataWithId } from "../../componentGraph/helperFunctions";
import { textSize } from "./sizes";
import { decrement, ExpertiseLevel, Level } from "../../UI/redux/expertise";
import { store } from "../../UI/redux/store";
import { startOnboardingAt } from "./onboarding";

export async function createInfoCard(
  visual: VisualDescriptor,
  count: number,
  categories: string[],
  expertiseLevel?: ExpertiseLevel
) {
  disable.disableFrame();
  disable.createDisabledArea(visual);

  const position = helpers.getVisualCardPos(
    visual,
    global.infoCardWidth,
    global.infoCardMargin
  );

  const style = helpers.getCardStyle(
    position.y,
    position.x,
    global.infoCardWidth,
    ""
  );
  if (position.pos === "left") {
    helpers.createCard("infoCard", style, "rectLeftBig");
    helpers.createCloseButton(
      "closeButton",
      "closeButtonPlacementBig",
      "",
      helpers.getCloseFunction(),
      "infoCard"
    );
  } else {
    helpers.createCard("infoCard", style, "rectRightBig");
    helpers.createCloseButton(
      "closeButton",
      "closeButtonPlacementBig",
      "",
      helpers.getCloseFunction(),
      "infoCard"
    );
  }

  createExpertiseSlider("visual", categories, count, "infoCard", visual);

  let traversal: TraversalElement[];
  if (global.explorationMode) {
    traversal = global.basicTraversal;
  } else {
    traversal = global.settings.traversalStrategy;
  }

  const visualData = getDataWithId(
    traversal,
    visual.name,
    categories,
    count
  );
  helpers.createCardContent(visualData?.title, "", "infoCard");

  createInfoCardButtons(traversal, visual.name, categories, count);
  await createVisualInfo(traversal, visual, count, categories, expertiseLevel);
}

export function createExpertiseSlider(type: string, categories: string[], count: number, parentId: string, visual?: VisualDescriptor){
  const labelAttributes = global.createLabelAttributes();
  labelAttributes.id = "sliderLabel";
  labelAttributes.for = "level";
  labelAttributes.parentId = parentId;
  labelAttributes.style = `font-size: ${textSize}rem; text-align: center; width: 100%; font-weight: 500;`
  labelAttributes.content = "Level of Detail:";
  const currentValue = currentSliderValue(categories).toString();
  elements.createLabel(labelAttributes);
  elements.createSlider({id: "level", min: "1", max: "3", value: currentValue, parentId: parentId},
  { type: type, categories: categories, count: count, visual: visual }, setExpertiseLevel);
  elements.createSliderLabels(["Low", "Medium", "High"], parentId);
}

function currentSliderValue(categories: string[]){
  const state = store.getState();
  const expertise = state.expertise;
  if(categories.includes("general") && categories.includes("insight")){
    if(expertise.Vis < expertise.Domain ){
      return expertise.Vis;
    } else {
      return expertise.Domain;
    }
  } else if(categories.includes("general")){
    return expertise.Vis;
  } else if(categories.includes("insight")){
    return expertise.Domain;
  }
  return "1";
}

function setExpertiseLevel(visualInfo: { type: string, categories: string[], count: number, visual?: VisualDescriptor }){
  const slider = document.getElementById("level")! as HTMLInputElement;
  const currentLevel = slider.value;
  let newExpertise: ExpertiseLevel;

  const state = store.getState();
  const expertise = state.expertise;

  if(visualInfo.categories.includes("general") && !visualInfo.categories.includes("insight")){
    newExpertise = {Domain: expertise.Domain, Vis: parseInt(currentLevel)};
  } else if(visualInfo.categories.includes("insight") && !visualInfo.categories.includes("general")){
    newExpertise = {Domain: parseInt(currentLevel), Vis: expertise.Vis};
  } else {
    newExpertise = {Domain: parseInt(currentLevel), Vis: parseInt(currentLevel)};
  }

  store.dispatch(decrement(newExpertise));
  startOnboardingAt(visualInfo.type, visualInfo.visual, visualInfo.categories, visualInfo.count, newExpertise);
}

export function createInfoCardButtons(
  traversal: TraversalElement[],
  id: string,
  categories: string[],
  count: number
) {
  if (
    currentId === 0 &&
    currentId === traversal.length - 1 &&
    global.isGuidedTour
  ) {
    createCardButtonsWithGroup(traversal, id, categories, count, "", "close");
  } else if (currentId === 0 && global.isGuidedTour) {
    createCardButtonsWithGroup(traversal, id, categories, count, "", "next");
  } else if (currentId === traversal.length - 1 && global.isGuidedTour) {
    createCardButtonsWithGroup(
      traversal,
      id,
      categories,
      count,
      "previous",
      "close"
    );
  } else {
    createCardButtonsWithGroup(
      traversal,
      id,
      categories,
      count,
      "previous",
      "next"
    );
  }
}

export function createCardButtonsWithGroup(
  traversal: TraversalElement[],
  id: string,
  categories: string[],
  count: number,
  leftButton: string,
  rightButton: string
) {
  const traversalElem = traversal[currentId].element;
  if (isGroup(traversalElem)) {
    let index = 0;
    let travLength = 0;
    for (let i = 0; i < traversalElem.visuals.length; i++) {
      const elemInGroup = traversalElem.visuals[i].find(
        (visInGroup: TraversalElement) =>
          visInGroup.element.id === id &&
          visInGroup.categories.every((category) =>
            categories.includes(category)
          ) &&
          visInGroup.count === count
      );
      if (elemInGroup) {
        index = traversalElem.visuals[i].indexOf(elemInGroup!);
        travLength = traversalElem.visuals[i].length - 1;
        setVisualInGroupIndex(index);
        setTraversalInGroupIndex(i);
      }
    }

    if (index === travLength && index === 0) {
      createCardButtonsForLastGroupElement("", rightButton, traversalElem);
    } else if (index === travLength) {
      createCardButtonsForLastGroupElement(
        "previousInGroup",
        rightButton,
        traversalElem
      );
    } else if (index === 0) {
      helpers.createCardButtons("cardButtons", leftButton, "", "nextInGroup");
    } else {
      helpers.createCardButtons(
        "cardButtons",
        "previousInGroup",
        "",
        "nextInGroup"
      );
    }
  } else {
    helpers.createCardButtons("cardButtons", leftButton, "", rightButton);
  }
}

function createCardButtonsForLastGroupElement(
  leftButton: string,
  rightButton: string,
  traversalElem: any
) {
  if (global.explorationMode) {
    helpers.createCardButtons("cardButtons", leftButton, "", "back to group");
  } else {
    if (traversalElem.type === groupType.onlyOne) {
      helpers.createCardButtons("cardButtons", leftButton, "", rightButton);
    } else {
      let traversed = 0;
      for (const trav of traversalElem.visuals) {
        if (
          trav.every((vis: TraversalElement) =>
            lookedAtInGroup.elements.find(
              (elem) =>
                elem.id === vis.element.id &&
                elem.categories.every((category) =>
                  vis.categories.includes(category)
                ) &&
                elem.count === vis.count
            )
          )
        ) {
          traversed++;
        }
      }
      if (traversed === traversalElem.visuals.length) {
        lookedAtInGroup.elements = [];
        lookedAtInGroup.groupId = "";
        helpers.createCardButtons("cardButtons", leftButton, "", rightButton);
      } else {
        helpers.createCardButtons(
          "cardButtons",
          leftButton,
          "",
          "back to group"
        );
      }
    }
  }
}

export function removeInfoCard() {
  elements.removeElement("infoCard");
  elements.removeElement("disabledUpper");
  elements.removeElement("disabledLower");
  elements.removeElement("disabledRight");
  elements.removeElement("disabledLeft");
  disable.removeFrame();
}

export function nextInfoCard() {
  if (global.explorationMode) {
    if (currentId == global.basicTraversal.length - 1) {
      setCurrentId(0);
    } else {
      setCurrentId(currentId + 1);
    }

    getCurrentTraversalElementType(global.basicTraversal);
  } else {
    if (currentId == global.settings.traversalStrategy.length - 1) {
      setCurrentId(0);
    } else {
      setCurrentId(currentId + 1);
    }

    lookedAtInGroup.groupId = "";
    lookedAtInGroup.elements = [];

    getCurrentTraversalElementType(global.settings.traversalStrategy);
  }
}

export function previousInfoCard() {
  if (global.explorationMode) {
    if (currentId == 0) {
      setCurrentId(global.basicTraversal.length - 1);
    } else {
      setCurrentId(currentId - 1);
    }

    getCurrentTraversalElementType(global.basicTraversal);
  } else {
    if (currentId == 0) {
      setCurrentId(global.settings.traversalStrategy.length - 1);
    } else {
      setCurrentId(currentId - 1);
    }

    lookedAtInGroup.groupId = "";
    lookedAtInGroup.elements = [];

    getCurrentTraversalElementType(global.settings.traversalStrategy);
  }
}

export function nextInGroup() {
  const currentElement = global.settings.traversalStrategy[currentId].element;

  setVisualInGroupIndex(visualInGroupIndex + 1);

  const traversal = currentElement.visuals[traversalInGroupIndex];
  const visual = traversal[visualInGroupIndex];

  const lookedAt = createLookedAtIds(
    visual.element.id,
    visual.categories,
    visual.count
  );
  updateLookedAt(lookedAt);

  if (currentElement.id === "dashboard") {
    createInformationCard("dashboard", visual.count);
  } else if (currentElement.id === "globalFilter") {
    createInformationCard("globalFilter", visual.count);
  } else {
    createInformationCard(
      "visual",
      visual.count,
      undefined,
      visual.element.id,
      visual.categories
    );
  }
}

export function previousInGroup() {
  const currentElement = global.settings.traversalStrategy[currentId].element;

  setVisualInGroupIndex(visualInGroupIndex - 1);

  const traversal = currentElement.visuals[traversalInGroupIndex];
  const visual = traversal[visualInGroupIndex];

  const lookedAt = createLookedAtIds(
    visual.element.id,
    visual.categories,
    visual.count
  );
  updateLookedAt(lookedAt);
  if (currentElement.id === "dashboard") {
    createInformationCard("dashboard", visual.count);
  } else if (currentElement.id === "globalFilter") {
    createInformationCard("globalFilter", visual.count);
  } else {
    createInformationCard(
      "visual",
      visual.count,
      undefined,
      visual.element.id,
      visual.categories
    );
  }
}
