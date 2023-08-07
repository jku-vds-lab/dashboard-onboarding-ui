import * as helpers from "./helperFunctions";
import * as global from "./globalVariables";
import * as elements from "./elements";
import { createFilterDisabledArea, removeFrame } from "./disableArea";
import Filter from "../../componentGraph/Filter";
import { removeElement } from "./elements";
import { createInfoCardButtons } from "./infoCards";
import { replacer } from "../../componentGraph/ComponentGraph";
import { TraversalElement, createTraversalElement } from "./traversal";
import { getTraversalElement } from "./createSettings";

export async function createFilterInfoCard(count: number) {
  createFilterDisabledArea();

  const style = helpers.getCardStyle(
    global.infoCardMargin,
    global.reportWidth! - global.infoCardMargin - global.infoCardWidth,
    global.infoCardWidth,
    ""
  );
  helpers.createCard("filterInfoCard", style, "rectLeftBig");

  helpers.createCloseButton(
    "closeButton",
    "closeButtonPlacementBig",
    "",
    helpers.getCloseFunction(),
    "filterInfoCard"
  );

  let traversal: TraversalElement[];
  if (global.explorationMode) {
    traversal = global.basicTraversal;
  } else {
    traversal = global.settings.traversalStrategy;
  }

  const filterData = helpers.getDataWithId(
    traversal,
    "globalFilter",
    ["general"],
    count
  );
  if (!filterData) {
    return;
  }

  helpers.createCardContent(
    filterData.title,
    filterData.generalInformation,
    "filterInfoCard"
  );
  createInfoCardButtons(traversal, "globalFilter", [], count);

  const filters = await getFilterInfos(traversal, count);
  if (filters) {
    createFilterList(traversal, filters, "contentText", count);
  }
}

export function createFilterList(
  traversal: TraversalElement[],
  list: string | any[],
  parentId: string,
  count: number
) {
  document.getElementById("contentText")!.innerHTML = "";
  const visualData = helpers.getDataWithId(
    traversal,
    "globalFilter",
    ["general"],
    count
  );
  if (!visualData) {
    return;
  }
  switch (visualData.mediaType) {
    case "Video":
      const attributes = global.createDivAttributes();
      attributes.id = "videoContainer";
      attributes.style = "position: relative;padding-bottom: 56.25%;height: 0;";
      attributes.parentId = "contentText";
      elements.createDiv(attributes);
      const videoAttributes = global.createVideoAttributes();
      videoAttributes.id = "video";
      videoAttributes.width = "100%";
      videoAttributes.parentId = "videoContainer";
      elements.createVideo(videoAttributes);

      const sourceAttributes = global.createSourceAttributes();
      sourceAttributes.id = "source";
      sourceAttributes.src = visualData.videoURL;
      sourceAttributes.type = "video/mp4";
      sourceAttributes.parentId = "video";
      elements.createSource(sourceAttributes);
      break;
    default:
      const ul = document.createElement("ul");
      document.getElementById(parentId)?.appendChild(ul);

      for (let i = 0; i < list.length; ++i) {
        const li = document.createElement("li");
        li.innerHTML = list[i];
        ul.appendChild(li);
      }
  }
}

export function getFilterDescription(filter: Filter) {
  let valueText = "";
  let filterText = "";
  if (filter.operation) {
    if (filter.values.length != 0) {
      valueText =
        " Its current value is " + helpers.dataToString(filter.values) + ".";
    }
    filterText =
      "The operation " +
      filter.operation +
      " is execuded for " +
      filter.attribute +
      "." +
      valueText;
  } else {
    filterText = "There is a filter for " + filter.attribute + ".";
  }
  return filter.attribute + ": " + filterText;
}

export async function getFilterInfos(
  traversal: TraversalElement[],
  count: number
) {
  const filterInfos = await helpers.getFilterInfo();

  const filterData = helpers.getDataWithId(
    traversal,
    "globalFilter",
    ["general"],
    count
  );
  if (!filterData) {
    return;
  }

  const newFilters = [];
  for (let i = 0; i < filterData.filterInfosStatus.length; ++i) {
    switch (filterData.filterInfosStatus[i]) {
      case global.infoStatus.original:
        newFilters.push(filterInfos[i]);
        break;
      case global.infoStatus.changed:
      case global.infoStatus.added:
        newFilters.push(filterData.changedFilterInfos[i]);
        break;
      default:
        break;
    }
  }
  return newFilters;
}

export function removeFilterInfoCard() {
  removeElement("filterInfoCard");
  removeElement("disabledLeft");
  removeFrame();
}

export async function saveFilterChanges(newInfo: string[], count: number) {
  const filterInfos = await helpers.getFilterInfo();

  let filterData = helpers.getDataWithId(
    global.settings.traversalStrategy,
    "globalFilter",
    ["general"],
    count
  );
  if (!filterData) {
    const traversalElem = createTraversalElement("");
    traversalElem.element = await getTraversalElement("globalFilter");
    traversalElem.count = count;
    traversalElem.categories = ["general"];
    global.settings.traversalStrategy.push(traversalElem);
    filterData = helpers.getDataWithId(
      global.settings.traversalStrategy,
      "globalFilter",
      ["general"],
      count
    );
  }

  for (let i = 0; i < newInfo.length; ++i) {
    if (newInfo[i] == "" || newInfo[i] == null) {
      filterData.filterInfosStatus[i] = "deleted";
      filterData.changedFilterInfos[i] = "";
    } else if (i >= filterData.filterInfosStatus.length) {
      filterData.filterInfosStatus.push("added");
      filterData.changedFilterInfos.push(newInfo[i]);
    } else if (newInfo[i] == filterInfos[i]) {
      filterData.filterInfosStatus[i] = "original";
      filterData.changedFilterInfos[i] = "";
    } else {
      filterData.filterInfosStatus[i] = "changed";
      filterData.changedFilterInfos[i] = newInfo[i];
    }
  }

  if (newInfo.length < filterData.filterInfosStatus.length) {
    for (let i = newInfo.length; i < filterData.filterInfosStatus.length; ++i) {
      filterData.filterInfosStatus[i] = "deleted";
      filterData.changedFilterInfos[i] = "";
    }
  }

  localStorage.setItem("settings", JSON.stringify(global.settings, replacer));
}

export async function resetFilterChanges(count: number) {
  const filterInfos = await helpers.getFilterInfo();

  const textBox = document.getElementById("textBox")! as HTMLTextAreaElement;
  textBox.innerHTML = "";

  const ul = document.createElement("ul");
  document.getElementById("textBox")?.appendChild(ul);

  for (let i = 0; i < filterInfos.length; ++i) {
    const li = document.createElement("li");
    li.innerHTML = filterInfos[i];
    ul.appendChild(li);
  }

  const filterData = helpers.getDataWithId(
    global.settings.traversalStrategy,
    "globalFilter",
    ["general"],
    count
  );
  if (!filterData) {
    const traversalElem = createTraversalElement("");
    traversalElem.element = await getTraversalElement("globalFilter");
    traversalElem.count = count;
    traversalElem.categories = ["general"];
    global.settings.traversalStrategy.push(traversalElem);
    return;
  }

  for (let i = 0; i < filterInfos.length; ++i) {
    filterData.filterInfosStatus[i] = "original";
    filterData.changedFilterInfos[i] = "";
  }

  if (filterInfos.length < filterData.filterInfosStatus.length) {
    const elemCount = filterData.filterInfosStatus.length - filterInfos.length;
    filterData.filterInfosStatus.splice(filterInfos.length, elemCount);
    filterData.changedFilterInfos.splice(filterInfos.length, elemCount);
  }

  localStorage.setItem("settings", JSON.stringify(global.settings, replacer));
}

export function getFilterInfoInEditor(count: number) {
  let infos = [];

  const filterInfos = helpers.getFilterInfo();

  const filterData = helpers.getDataWithId(
    global.settings.traversalStrategy,
    "globalFilter",
    ["general"],
    count
  );
  if (!filterData) {
    infos = filterInfos;
  } else {
    for (let i = 0; i < filterData.filterInfosStatus.length; ++i) {
      switch (filterData.filterInfosStatus[i]) {
        case global.infoStatus.original:
          infos.push(filterInfos[i]);
          break;
        case global.infoStatus.changed:
        case global.infoStatus.added:
          infos.push(filterData.changedFilterInfos[i]);
          break;
        default:
          break;
      }
    }
  }

  const textBox = document.getElementById("textBox")! as HTMLTextAreaElement;
  textBox.innerHTML = "";

  const ul = document.createElement("ul");
  document.getElementById("textBox")?.appendChild(ul);

  for (let i = 0; i < infos.length; ++i) {
    const li = document.createElement("li");
    li.innerHTML = infos[i];
    ul.appendChild(li);
  }
}
