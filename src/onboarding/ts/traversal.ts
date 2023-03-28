import { createDashboardInfoCard, removeDashboardInfoCard } from "./dashboardInfoCard";
import { removeFrame } from "./disableArea";
import { removeElement } from "./elements";
import { createFilterInfoCard, removeFilterInfoCard } from "./filterInfoCards";
import { currentVisuals } from "./globalVariables";
import { removeOnboardingOverlay } from "./helperFunctions";
import { createInfoCard, removeInfoCard } from "./infoCards";
import { removeIntroCard } from "./introCards";
import { createOverlayForVisuals } from "./onboarding";
import * as helpers from "./helperFunctions";
import * as global from "./globalVariables";
import { replacer } from "../../componentGraph/ComponentGraph";
import { getTraversalElement } from "./createSettings";

export let traversalStrategy: TraversalElement[] = [];
export const lookedAtInGroup = createLookedAtInGroup();
export let currentId=0;

export interface TraversalElement{
    element: any;
    count: number;
}

export interface Group{
    id: string;
    type: groupType;
    visuals: any[];
}

export interface LookedAtInGroup{
    groupId: string;
    elements: string[];
}

export function isGroup(object: any): object is Group {
    return object.type && Object.values(groupType).includes(object.type);
}

export enum groupType {
    all = "all",
    atLeastOne = "atLeastOne",
    onlyOne = "onlyOne"
}

export function createTraversalElement(){
    const elem: TraversalElement = {
        element: null,
        count: 1
    }
    return elem;
}

export function createGroup(){
    const group: Group = {
        id: "group",
        type: groupType.all,
        visuals: []
    }
    return group;
}

export function createLookedAtInGroup(){
    const lookedAtInGroup: LookedAtInGroup = {
        groupId: "",
        elements: []
    }
    return lookedAtInGroup;
}

export function setCurrentId(newId: number){
    currentId = newId;
}
export function setTraversalStrategy(newTraversalStrategy: any[]){
    traversalStrategy = newTraversalStrategy;
}

export async function setBasicTraversalStrategy(){
    const trav = [];
    const traversalElem1 = createTraversalElement();
    traversalElem1.element = await getTraversalElement("dashboard");
    trav.push(traversalElem1);
    for(const vis of global.currentVisuals){
        const traversalElem = createTraversalElement();
        traversalElem.element = await getTraversalElement(vis.name);
        trav.push(traversalElem);
    }
    const traversalElem2 = createTraversalElement();
    traversalElem2.element = await getTraversalElement("globalFilter");
    trav.push(traversalElem2);
    return trav;
}

export async function setTestAllGroupsTraversalStrategy(){
    const trav = [];
    const traversalElem1 = createTraversalElement();
    traversalElem1.element = await getTraversalElement("dashboard");
    trav.push(traversalElem1);
    const traversalElem2 = createTraversalElement();
    traversalElem2.element = await getTraversalElement(currentVisuals[0].name);
    trav.push(traversalElem2);
    const group = createGroup();
    const traversalElem2g = createTraversalElement();
    traversalElem2g.element = await getTraversalElement("dashboard");
    traversalElem2g.count = 2;
    group.visuals.push(traversalElem2g);
    const traversalElemv1 = createTraversalElement();
    traversalElemv1.element = await getTraversalElement(currentVisuals[2].name);
    group.visuals.push(traversalElemv1);
    const traversalElemv2 = createTraversalElement();
    traversalElemv2.element = await getTraversalElement(currentVisuals[3].name);
    group.visuals.push(traversalElemv2);
    const traversalElemv3 = createTraversalElement();
    traversalElemv3.element = await getTraversalElement(currentVisuals[4].name);
    group.visuals.push(traversalElemv3);
    const traversalElem4 = createTraversalElement();
    traversalElem4.element = group;
    trav.push(traversalElem4);
    const traversalElem5 = createTraversalElement();
    traversalElem5.element = await getTraversalElement(currentVisuals[5].name);
    trav.push(traversalElem5);
    const traversalElem6 = createTraversalElement();
    traversalElem6.element = await getTraversalElement(currentVisuals[6].name);
    trav.push(traversalElem6);
    const traversalElem7 = createTraversalElement();
    traversalElem7.element = await getTraversalElement("globalFilter");
    trav.push(traversalElem7);
    return trav;
}

export async function setTestAtLeastOneGroupsTraversalStrategy(){
    const trav = [];
    const traversalElem1 = createTraversalElement();
    traversalElem1.element = await getTraversalElement("dashboard");
    trav.push(traversalElem1);
    const traversalElem2 = createTraversalElement();
    traversalElem2.element = await getTraversalElement(currentVisuals[3].name);
    trav.push(traversalElem2);
    const traversalElem3 = createTraversalElement();
    traversalElem3.element = await getTraversalElement(currentVisuals[4].name);
    trav.push(traversalElem3);
    const group = createGroup();
    group.type = groupType.atLeastOne;
    const traversalElemv1 = createTraversalElement();
    traversalElemv1.element = await getTraversalElement(currentVisuals[0].name);
    group.visuals.push(traversalElemv1);
    const traversalElemv2 = createTraversalElement();
    traversalElemv2.element = await getTraversalElement(currentVisuals[1].name);
    group.visuals.push(traversalElemv2);
    const traversalElemv3 = createTraversalElement();
    traversalElemv3.element = await getTraversalElement(currentVisuals[2].name);
    group.visuals.push(traversalElemv3);
    const traversalElem4 = createTraversalElement();
    traversalElem4.element = group;
    trav.push(traversalElem4);
    const traversalElem5 = createTraversalElement();
    traversalElem5.element = await getTraversalElement(currentVisuals[5].name);
    trav.push(traversalElem5);
    const traversalElem6 = createTraversalElement();
    traversalElem6.element = await getTraversalElement(currentVisuals[6].name);
    trav.push(traversalElem6);
    const traversalElem7 = createTraversalElement();
    traversalElem7.element = await getTraversalElement("globalFilter");
    trav.push(traversalElem7);
    return trav;
}

export async function setTestOnlyOneGroupsTraversalStrategy(){
    const trav = [];
    const traversalElem1 = createTraversalElement();
    traversalElem1.element = await getTraversalElement("dashboard");
    trav.push(traversalElem1);
    const traversalElem2 = createTraversalElement();
    traversalElem2.element = await getTraversalElement(currentVisuals[2].name);
    trav.push(traversalElem2);
    const traversalElem3 = createTraversalElement();
    traversalElem3.element = await getTraversalElement(currentVisuals[3].name);
    trav.push(traversalElem3);
    const group = createGroup();
    group.type = groupType.onlyOne;
    const traversalElemv1 = createTraversalElement();
    traversalElemv1.element = await getTraversalElement(currentVisuals[0].name);
    group.visuals.push(traversalElemv1);
    const traversalElemv2 = createTraversalElement();
    traversalElemv2.element = await getTraversalElement(currentVisuals[1].name);
    group.visuals.push(traversalElemv2);
    const traversalElemv3 = createTraversalElement();
    traversalElemv3.element = await getTraversalElement(currentVisuals[5].name);
    group.visuals.push(traversalElemv3);
    const traversalElem4 = createTraversalElement();
    traversalElem4.element = group;
    trav.push(traversalElem4);
    const traversalElem5 = createTraversalElement();
    traversalElem5.element = await getTraversalElement(currentVisuals[4].name);
    trav.push(traversalElem5);
    const traversalElem6 = createTraversalElement();
    traversalElem6.element = await getTraversalElement(currentVisuals[6].name);
    trav.push(traversalElem6);
    const traversalElem7 = createTraversalElement();
    traversalElem7.element = await getTraversalElement("globalFilter");
    trav.push(traversalElem7);
    return trav;
}

export function createInformationCard(type: string, count: number, visuals?: any[], visualId?:string){
    removeFrame();
    removeIntroCard();
    removeInfoCard();
    removeDashboardInfoCard();
    removeFilterInfoCard();
    removeOnboardingOverlay();

    switch(type){
        case "dashboard":
            createDashboardInfoCard(count);
            break;
        case "globalFilter":
            createFilterInfoCard(count);
            break;
        case "group":
            createExplainGroupCard();
            createOverlayForVisuals(visuals!);
            break;
        case "visual":
            createInfoCard(currentVisuals.find(vis => vis.name === visualId), count);
            break;
    }
}

export function getCurrentTraversalElementType(){
    const currentElement = global.settings.traversalStrategy[currentId];

    if(isGroup(currentElement.element)){
        createInformationCard("group", currentElement.count, currentElement.element.visuals, undefined);
    } else if(currentElement.element.id === "dashboard"){
        createInformationCard("dashboard", currentElement.count);
    } else if(currentElement.element.id === "globalFilter"){
        createInformationCard("globalFilter", currentElement.count);
    } else {
        createInformationCard("visual", currentElement.count, undefined, currentElement.element.id);
    }
}

export function createGroupOverlay(){
    const currentElement = global.settings.traversalStrategy[currentId];
    createInformationCard("group", currentElement.count, currentElement.element.visuals, undefined);
}


export function findVisualIndexInTraversal(id: string, count: number){
    const elem = global.settings.traversalStrategy.find(vis => vis.element.id === id  && vis.count === count);
    let index = global.settings.traversalStrategy.indexOf(elem!);
    if(index  == -1){
       const groups =  global.settings.traversalStrategy.filter(object => isGroup(object.element));
       for(const group of groups){
            const elemInGroup = group.element.visuals.find((visInGroup: TraversalElement) => visInGroup.element.id === id  && visInGroup.count === count);
            if(elemInGroup){
                const groupElem = global.settings.traversalStrategy.find(vis => vis.element.id === group.element.id  && vis.count === group.count);
                const groupIndex = global.settings.traversalStrategy.indexOf(groupElem!);
                return groupIndex;
            }
       }
       index = -1;
    }
    return index;
}

export function findTraversalVisual(id:string){
    if(!isGroup(id) && id !== "dashboard" && id !== "globalFilter"){
        return currentVisuals.find((vis: any) => vis.name === id);
    }

    return null;
}

export function findCurrentTraversalVisual(){
    const traversalElem = global.settings.traversalStrategy[currentId].element;
    
    if(!isGroup(traversalElem) && traversalElem.id !== "dashboard" && traversalElem.id !== "globalFilter"){
        return [currentVisuals.find((vis: any) => vis.name === traversalElem.id), traversalElem.count];
    }

    return null;
}

export function findCurrentTraversalCount(){
    return global.settings.traversalStrategy[currentId].count;
}

export function findCurrentTraversalVisualIndex(){
    const traversalElem = global.settings.traversalStrategy[currentId].element;
    
    if(!isGroup(traversalElem) && traversalElem.id !== "dashboard" && traversalElem.id !== "globalFilter"){
        return currentVisuals.findIndex((vis: any) => vis.name === traversalElem.id);
    }

    return 0;
}

export function removeExplainGroupCard(){
    removeElement("explainGroupCard");
}

export function createExplainGroupCard(){
    const style = `overflow: auto;position:fixed;top:10px;left:50%;margin-left:` + -(global.explainGroupCardWidth/2) + `px;width:`+ global.explainGroupCardWidth + `px;height:` + global.explainGroupCardHeight + `px;pointer-events:auto;border-radius:10px;background-color:lightsteelblue;z-index: 99 !important;`;
    helpers.createCard("explainGroupCard", style, "");
    helpers.addContainerOffset(global.explainGroupCardHeight);
    helpers.createCloseButton("closeButton", "closeButtonPlacementBig", "", helpers.getCloseFunction(), "explainGroupCard");
    helpers.createCardContent("", createExplainGroupText(), "explainGroupCard");
}

function createExplainGroupText(){
    const currentElement = traversalStrategy[currentId].element;
    let explaination = "Please click on one of the highlighted visualisations to get its explaination.";

    switch(currentElement.type){
        case groupType.all:
            explaination += " You can look at the visualisations in any order but you will have to look at all of them before you can continue.";
            break;
        case groupType.atLeastOne:
            explaination += " You can look at one visualisation or multiple and then continue.";
            break;
        case groupType.onlyOne:
            explaination += " You can look at one of the viualisation and then continue.";
            break;
    }

    return explaination;
}

export async function updateTraversal(newTraversalStrategy: TraversalElement[]){
    const traversal: TraversalElement[] = [];
    const oldTraversalStrategy = global.settings.traversalStrategy;
    setTraversalStrategy([]);
    global.settings.traversalStrategy = [];
    localStorage.setItem("settings", JSON.stringify(global.settings, replacer));

    for (const elem of newTraversalStrategy) {
        if(isGroup(elem.element)){
            const oldGroup = oldTraversalStrategy.find(elemSetting => elemSetting.element.id === elem.element.id  && elemSetting.count === elem.count);
            if(oldGroup){
                const newVisuals = [];
                for(const groupElem of elem.element.visuals){
                    const oldSetting = oldGroup?.element.visuals.find((elemSetting: TraversalElement) => elemSetting.element.id === groupElem.element.id  && elemSetting.count === groupElem.count);
                    if(oldSetting){
                        newVisuals.push(oldSetting);
                    } else {
                        const traversalElem = createTraversalElement();
                        traversalElem.element = await getTraversalElement(groupElem.element.id);
                        traversalElem.count = groupElem.count;
                        newVisuals.push(traversalElem);
                    }
                }
                elem.element.visuals = newVisuals;
                traversal.push(elem);
            } else {
                const traversalElem = createTraversalElement();
                traversalElem.element = await getTraversalElement(elem.element);
                traversalElem.count = elem.count;
                traversal.push(traversalElem);
            }
        }else{
            const oldSetting = oldTraversalStrategy.find(elemSetting => elemSetting.element.id === elem.element.id && elemSetting.count === elem.count);
            if(oldSetting){
                traversal.push(oldSetting);
            } else {
                const traversalElem = createTraversalElement();
                    traversalElem.element = await getTraversalElement(elem.element.id);
                    traversalElem.count = elem.count;
                    traversal.push(traversalElem);
            }
        }
    }

    setTraversalStrategy(traversal);
    global.settings.traversalStrategy = traversal;
    console.log(global.settings)
    localStorage.setItem("settings", JSON.stringify(global.settings, replacer));
}

export function updateLookedAt(id: string){
    const currentElement = global.settings.traversalStrategy[currentId].element;
    if(isGroup(currentElement)){
        if(currentElement.id === lookedAtInGroup.groupId){
            lookedAtInGroup.elements.push(id);
        } else {
            lookedAtInGroup.groupId = currentElement.id;
            lookedAtInGroup.elements = [id];
        }
    } else {
        lookedAtInGroup.groupId = "";
        lookedAtInGroup.elements = [];
    }
}