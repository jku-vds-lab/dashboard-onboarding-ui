import * as helpers from "./helperFunctions";
import * as global from "./globalVariables";
import * as elements from "./elements";
import * as disable from "./disableArea";
import { createIntroCard } from "./introCards";
import { createFilterInfoCard, removeFilterInfoCard } from "./filterInfoCards";
import fetch from "node-fetch";
import { createInfoList, createVisualInfo } from "./visualInfo";
import {
  createDashboardInfoCard,
  getNewDashboardInfo,
  removeDashboardInfoCard,
} from "./dashboardInfoCard";
import {
  createGroupOverlay,
  createInformationCard,
  createLookedAtIds,
  createTraversalElement,
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
  traversalStrategy,
  updateLookedAt,
  visualInGroupIndex,
} from "./traversal";
import { textSize } from "./sizes";
import { replacer } from "../../componentGraph/ComponentGraph";
import { image } from "d3";
import { getTraversalElement } from "./createSettings";

export async function createInfoCard(
  visual: any,
  count: number,
  categories: string[]
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

  let traversal: TraversalElement[];
  if (global.explorationMode) {
    traversal = global.basicTraversal;
  } else {
    traversal = global.settings.traversalStrategy;
  }

  const visualData = helpers.getDataWithId(
    traversal,
    visual.name,
    categories,
    count
  );
  helpers.createCardContent(visualData?.title, "", "infoCard");

  createInfoCardButtons(traversal, visual.name, categories, count);
  await createVisualInfo(traversal, visual, count, categories);
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

export async function getVisualInfoInEditor(idParts: string[], count: number) {
  let infos = [];
  let images = [];

  const categories = [];
  if (idParts.length > 2) {
    categories.push(idParts[1].toLowerCase());
  } else {
    categories.push("general");
  }
  const visualData = helpers.getDataWithId(
    global.settings.traversalStrategy,
    idParts[0],
    categories,
    count
  );
  const visual = global.allVisuals.find(function (visual) {
    return visual.name == idParts[0];
  });
  const visualInfos = await helpers.getVisualInfos(visual); // this waws the original await statement

  if (!visualData) {
    if (idParts.length > 2 && idParts[1] == "Insight") {
      images = visualInfos.insightImages;
      infos = visualInfos.insightInfos;
    } else if (idParts.length > 2 && idParts[1] == "Interaction") {
      images = visualInfos.interactionImages;
      infos = visualInfos.interactionInfos;
    } else {
      images = visualInfos.generalImages;
      infos = visualInfos.generalInfos;
    }
  } else {
    if (idParts.length > 2 && idParts[1] == "Insight") {
      for (let i = 0; i < visualData.insightInfosStatus.length; ++i) {
        switch (visualData.insightInfosStatus[i]) {
          case global.infoStatus.original:
            images.push(visualInfos.insightImages[i]);
            infos.push(visualInfos.insightInfos[i]);
            break;
          case global.infoStatus.changed:
          case global.infoStatus.added:
            images.push("dotImg");
            infos.push(visualData.changedInsightInfos[i]);
            break;
          default:
            break;
        }
      }
    } else if (idParts.length > 2 && idParts[1] == "Interaction") {
      for (let i = 0; i < visualData.interactionInfosStatus.length; ++i) {
        switch (visualData.interactionInfosStatus[i]) {
          case global.infoStatus.original:
            images.push(visualInfos.interactionImages[i]);
            infos.push(visualInfos.interactionInfos[i]);
            break;
          case global.infoStatus.changed:
          case global.infoStatus.added:
            images.push("dotImg");
            infos.push(visualData.changedInteractionInfos[i]);
            break;
          default:
            break;
        }
      }
    } else {
      for (let i = 0; i < visualData.generalInfosStatus.length; ++i) {
        switch (visualData.generalInfosStatus[i]) {
          case global.infoStatus.original:
            images.push(visualInfos.generalImages[i]);
            infos.push(visualInfos.generalInfos[i]);
            break;
          case global.infoStatus.changed:
          case global.infoStatus.added:
            images.push("dotImg");
            infos.push(visualData.changedGeneralInfos[i]);
            break;
          default:
            break;
        }
      }
    }
  }

  const textBox = document.getElementById("textBox")! as HTMLTextAreaElement;
  textBox.innerHTML = "";

  await createInfoList(images, infos, "textBox", true);
}

export async function saveVisualChanges(
  newInfo: string[],
  idParts: string[],
  count: number
) {
  const categories = [];
  if (idParts.length > 2) {
    categories.push(idParts[1].toLowerCase());
  } else {
    categories.push("general");
  }
  let visualData = helpers.getDataWithId(
    global.settings.traversalStrategy,
    idParts[0],
    categories,
    count
  );
  if (!visualData) {
    const traversalElem = createTraversalElement("");
    traversalElem.element = await getTraversalElement(idParts[0]);
    traversalElem.count = count;
    traversalElem.categories = categories;
    global.settings.traversalStrategy.push(traversalElem);
    visualData = helpers.getDataWithId(
      global.settings.traversalStrategy,
      idParts[0],
      categories,
      count
    );
  }

  const original = await getOriginalVisualInfos(idParts);
  const originalInfo = original[1];
  if (!originalInfo) {
    return;
  }

  if (idParts.length > 2 && idParts[1] == "Insight") {
    for (let i = 0; i < newInfo.length; ++i) {
      if (newInfo.length == 0 || newInfo == null) {
        visualData.insightInfosStatus[0] = "deleted";
        visualData.changedInsightInfos[0] = "";
        return;
      } else if (i >= originalInfo.length) {
        visualData.insightInfosStatus.push("added");
        visualData.changedInsightInfos.push(newInfo[i]);
      } else if (newInfo[i] == originalInfo[i]) {
        visualData.insightInfosStatus[i] = "original";
        visualData.changedInsightInfos[i] = "";
      } else {
        visualData.insightInfosStatus[i] = "changed";
        visualData.changedInsightInfos[i] = newInfo[i];
      }
    }

    if (newInfo.length < visualData.insightInfosStatus.length) {
      for (
        let i = newInfo.length;
        i < visualData.insightInfosStatus.length;
        ++i
      ) {
        visualData.insightInfosStatus[i] = "deleted";
        visualData.changedInsightInfos[i] = "";
      }
    }
  } else if (idParts.length > 2 && idParts[1] == "Interaction") {
    for (let i = 0; i < newInfo.length; ++i) {
      if (newInfo.length == 0 || newInfo == null) {
        visualData.interactionInfosStatus[0] = "deleted";
        visualData.changedInteractionInfos[0] = "";
        return;
      } else if (i >= originalInfo.length) {
        visualData.interactionInfosStatus.push("added");
        visualData.changedInteractionInfos.push(newInfo[i]);
      } else if (newInfo[i] == originalInfo[i]) {
        visualData.interactionInfosStatus[i] = "original";
        visualData.changedInteractionInfos[i] = "";
      } else {
        visualData.interactionInfosStatus[i] = "changed";
        visualData.changedInteractionInfos[i] = newInfo[i];
      }
    }

    if (newInfo.length < visualData.interactionInfosStatus.length) {
      for (
        let i = newInfo.length;
        i < visualData.interactionInfosStatus.length;
        ++i
      ) {
        visualData.interactionInfosStatus[i] = "deleted";
        visualData.changedInteractionInfos[i] = "";
      }
    }
  } else {
    for (let i = 0; i < newInfo.length; ++i) {
      if (newInfo.length == 0 || newInfo == null) {
        visualData.generalInfosStatus[0] = "deleted";
        visualData.changedGeneralInfos[0] = "";
        return;
      } else if (i >= originalInfo.length) {
        visualData.generalInfosStatus.push("added");
        visualData.changedGeneralInfos.push(newInfo[i]);
      } else if (newInfo[i] == originalInfo[i]) {
        visualData.generalInfosStatus[i] = "original";
        visualData.changedGeneralInfos[i] = "";
      } else {
        visualData.generalInfosStatus[i] = "changed";
        visualData.changedGeneralInfos[i] = newInfo[i];
      }
    }

    if (newInfo.length < visualData.generalInfosStatus.length) {
      for (
        let i = newInfo.length;
        i < visualData.generalInfosStatus.length;
        ++i
      ) {
        visualData.generalInfosStatus[i] = "deleted";
        visualData.changedGeneralInfos[i] = "";
      }
    }
  }

  localStorage.setItem("settings", JSON.stringify(global.settings, replacer));
}

async function getOriginalVisualInfos(idParts: string[]) {
  let info;
  let images;
  const visual = global.currentVisuals.find((vis) => vis.name === idParts[0]);
  const visualInfos = await helpers.getVisualInfos(visual);

  if (idParts.length > 2 && idParts[1] == "Insight") {
    images = visualInfos.insightImages;
    info = visualInfos.insightInfos;
  } else if (idParts.length > 2 && idParts[1] == "Interaction") {
    images = visualInfos.interactionImages;
    info = visualInfos.interactionInfos;
  } else {
    images = visualInfos.generalImages;
    info = visualInfos.generalInfos;
  }
  return [images, info];
}

export async function resetVisualChanges(idParts: string[], count: number) {
  const categories = [];
  if (idParts.length > 2) {
    categories.push(idParts[1].toLowerCase());
  } else {
    categories.push("general");
  }

  const originalInfo = await getOriginalVisualInfos(idParts);
  if (!originalInfo) {
    return;
  }

  const textBox = document.getElementById("textBox")! as HTMLTextAreaElement;
  textBox.innerHTML = "";

  await createInfoList(originalInfo[0], originalInfo[1], "textBox", true);

  const visualData = helpers.getDataWithId(
    global.settings.traversalStrategy,
    idParts[0],
    categories,
    count
  );
  if (!visualData) {
    const traversalElem = createTraversalElement("");
    traversalElem.element = await getTraversalElement(idParts[0]);
    traversalElem.count = count;
    traversalElem.categories = categories;
    global.settings.traversalStrategy.push(traversalElem);
    return;
  }

  if (idParts.length > 2 && idParts[1] == "Insight") {
    for (let i = 0; i < visualData.insightInfosStatus.length; ++i) {
      visualData.insightInfosStatus[i] = "original";
      visualData.changedInsightInfos[i] = "";
    }
    if (originalInfo.length < visualData.insightInfosStatus.length) {
      const elemCount =
        visualData.insightInfosStatus.length - originalInfo.length;
      visualData.insightInfosStatus.splice(originalInfo.length, elemCount);
      visualData.changedInsightInfos.splice(originalInfo.length, elemCount);
    }
  } else if (idParts.length > 2 && idParts[1] == "Interaction") {
    for (let i = 0; i < visualData.interactionInfosStatus.length; ++i) {
      visualData.interactionInfosStatus[i] = "original";
      visualData.changedInteractionInfos[i] = "";
    }
    if (originalInfo.length < visualData.interactionInfosStatus.length) {
      const elemCount =
        visualData.interactionInfosStatus.length - originalInfo.length;
      visualData.interactionInfosStatus.splice(originalInfo.length, elemCount);
      visualData.changedInteractionInfos.splice(originalInfo.length, elemCount);
    }
  } else {
    for (let i = 0; i < visualData.generalInfosStatus.length; ++i) {
      visualData.generalInfosStatus[i] = "original";
      visualData.changedGeneralInfos[i] = "";
    }

    if (originalInfo.length < visualData.generalInfosStatus.length) {
      const elemCount =
        visualData.generalInfosStatus.length - originalInfo.length;
      visualData.generalInfosStatus.splice(originalInfo.length, elemCount);
      visualData.changedGeneralInfos.splice(originalInfo.length, elemCount);
    }
  }

  localStorage.setItem("settings", JSON.stringify(global.settings, replacer));
}
