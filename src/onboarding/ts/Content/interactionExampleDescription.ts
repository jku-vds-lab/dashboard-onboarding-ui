import { VisualDescriptor } from "powerbi-client";
import { getSpecificDataInfo } from "../../../componentGraph/helperFunctions";
import { allVisuals } from "../globalVariables";
import BarChart from "./barChartVisualContent";
import ColumnChart from "./columnChartVisualContent";
import LineChart from "./lineChartVisualContent";

export default class InteractionExampleDescription {
    private interactionInfo = {
        click: "Please click on the ",
        representing: " representing ",
        data: " data ",
        element: "element ",
    };

    private prepositions = {
        for: " for ",
        and: " and ",
    };

    private punctuations = {
        dot: ".",
    };

    private lineBreak = "<br>";

    interactionText(mark: string, dataName: string, axisValues?: string[], legendValues?: string[]) {
        let text = "";

        text =
            this.interactionInfo.click +
            mark +
            this.interactionInfo.representing +
            dataName;

        if(axisValues && legendValues){
            text += this.prepositions.for + 
            legendValues[Math.floor(legendValues.length / 2)] + this.prepositions.and +
            axisValues[Math.floor(axisValues.length / 2)];
        } else if(axisValues){
            text += this.prepositions.for +
            axisValues[Math.floor(axisValues.length / 2)];
        } else if(legendValues){
            text += this.prepositions.for + 
            legendValues[Math.floor(legendValues.length / 2)];
        }
            
        text += this.punctuations.dot + this.lineBreak;

        return text;
    }

    interactionElementText(dataValue: string) {
        let text = "";

        text =
            this.interactionInfo.click +
            this.interactionInfo.element +
            dataValue +
            this.punctuations.dot + 
            this.lineBreak;

        return text;
    }

    
  async getInteractionInfo(visual: LineChart | BarChart | ColumnChart) { //TODO add slicer and use interactionElementText function for it
    const visualization: VisualDescriptor | undefined = allVisuals.find((vis) => {
        return vis.name === visual.id;
    });
    if(!visualization){
        return this.interactionElementText(visual.dataName);
    }

    const axisValues = await getSpecificDataInfo(visualization, visual.axis);
    const legendValues = await getSpecificDataInfo(visualization, visual.legend);
    
    return this.interactionText(visual.chart.mark, visual.dataName, axisValues, legendValues);
  }
}
