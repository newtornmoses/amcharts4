/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import { system } from "../System";
import { registry } from "../Registry";
import { Container } from "../Container";
import { Paper } from "../rendering/Paper";
import { SVGContainer, svgContainers } from "../rendering/SVGContainer";
import { FocusFilter } from "../rendering/filters/FocusFilter";
import { Preloader } from "../elements/Preloader";
import { AmChartsLogo } from "../elements/AmChartsLogo";
import { Tooltip } from "../elements/Tooltip";
import { percent } from "./Percent";
import { options } from "../Options";
import * as $array from "./Array";
import * as $type from "./Type";
import * as $dom from "./DOM";
/**
 * ============================================================================
 * INSTANTIATION FUNCTIONS
 * ============================================================================
 * @hidden
 */
/**
 * Creates all HTML and SVG containers needed for the chart instance, as well
 * as the new [[Sprite]] (as specified in `classType` parameter).
 *
 * @param  {Optional<HTMLElement | string>}  htmlElement  A container to creat elements in
 * @param  {T}                               classType    A class definition of the new element to create
 * @return {T}                                            Newly-created Sprite object
 */
function createChild(htmlElement, classType) {
    var htmlContainer = $dom.getElement(htmlElement);
    if (htmlContainer) {
        htmlContainer.innerHTML = "";
        // we need to create another div with position:absolute in order div elements added inside could be positioned relatively
        /*
        let innerContainer = document.createElement("div");
        let style = innerContainer.style;
        style.width = "100%";
        style.height = "100%";
        style.position = "relative";
*/
        //	htmlContainer.appendChild(innerContainer);
        var svgDiv = new SVGContainer(htmlContainer);
        var paper = new Paper(svgDiv.SVGContainer);
        paper.id = "svg-" + (svgContainers.length - 1);
        // the approach with masks is chosen because overflow:visible is set on SVG element in order tooltips could go outside
        // svg area - this is often needed when working with small charts.
        // main container which holds content container and tooltips container
        var container = new Container();
        container.htmlContainer = htmlContainer;
        container.svgContainer = svgDiv;
        container.width = percent(100);
        container.height = percent(100);
        container.paper = paper;
        // this is set from parent container, but this one doesn't have, so do it manually.
        container.relativeWidth = 1;
        container.relativeHeight = 1;
        svgDiv.container = container;
        // content container
        // setting mask directly on classType object would result mask to shift together with object transformations
        var contentContainer_1 = container.createChild(Container);
        contentContainer_1.width = percent(100);
        contentContainer_1.height = percent(100);
        // content mask
        contentContainer_1.mask = contentContainer_1.background;
        // creating classType instance
        var sprite_1 = contentContainer_1.createChild(classType);
        sprite_1.isBaseSprite = true;
        sprite_1.focusFilter = new FocusFilter();
        // tooltip container
        var tooltipContainer_1 = container.createChild(Container);
        tooltipContainer_1.width = percent(100);
        tooltipContainer_1.height = percent(100);
        tooltipContainer_1.isMeasured = false;
        contentContainer_1.tooltipContainer = tooltipContainer_1;
        sprite_1.tooltip = new Tooltip();
        sprite_1.tooltip.hide(0);
        sprite_1.tooltip.setBounds({ x: 0, y: 0, width: tooltipContainer_1.maxWidth, height: tooltipContainer_1.maxHeight });
        tooltipContainer_1.events.on("maxsizechanged", function () {
            $type.getValue(sprite_1.tooltip).setBounds({ x: 0, y: 0, width: tooltipContainer_1.maxWidth, height: tooltipContainer_1.maxHeight });
        });
        //@todo: maybe we don't need to create one by default but only on request?
        contentContainer_1.preloader = new Preloader();
        contentContainer_1.preloader.events.on("inited", function () {
            contentContainer_1.preloader.__disabled = true;
        });
        if (!options.commercialLicense) {
            tooltipContainer_1.createChild(AmChartsLogo);
        }
        sprite_1.numberFormatter; // need to create one.
        // Set this as an autonomouse instance
        // Controls like Preloader, Export will use this.
        contentContainer_1.isStandaloneInstance = true;
        return sprite_1;
    }
    else {
        system.log("html container not found");
    }
}
/**
 * A shortcut to creating a chart instance.
 *
 * The first argument is either a reference to or an id of a DOM element to be
 * used as a container for the chart.
 *
 * The second argument is the type reference of the chart type. (for plain
 * JavaScript users this can also be a string indicating chart type)
 *
 * ```TypeScript
 * let chart = am4core.create("chartdiv", am4charts.PieChart);
 * ```
 * ```JavaScript
 * // Can pass in chart type reference like this:
 * var chart = am4core.create("chartdiv", am4charts.PieChart);
 *
 * // ... or chart class type as a string:
 * var chart = am4core.create("chartdiv", "PieChart");
 * ```
 *
 * @param  {HTMLElement | string}  htmlElement  Reference or id of the target container element
 * @param  {T}                     classType    Class type of the target chart type
 * @return {T}                                  Chart instance
 */
export function create(htmlElement, classType) {
    // This is a nasty hack for the benefit of vanilla JS users, who do not
    // enjoy benefits of type-check anyway.
    // We're allowing passing in a name of the class rather than type reference
    // itself.
    var classError;
    if ($type.isString(classType)) {
        if ($type.hasValue(registry.registeredClasses[classType])) {
            classType = registry.registeredClasses[classType];
        }
        else {
            classType = registry.registeredClasses["Container"];
            classError = new Error("Class [" + classType + "] is not loaded.");
            return;
        }
    }
    // Create the chart
    var chart = createChild(htmlElement, classType);
    // Error?
    if (classError) {
        chart.raiseCriticalError(classError);
    }
    return chart;
}
/**
 * A shortcut to creating a chart from a config object.
 *
 * Example:
 *
 * ```TypeScript
 * let chart am4core.createFromConfig({ ... }, "chartdiv", am4charts.XYChart );
 * ```
 * ```JavaScript
 * var chart am4core.createFromConfig({ ... }, "chartdiv", "XYChart" );
 * ```
 *
 * If `chartType` parameter is not supplied it must be set in a config object,
 * via reference to chart type, e.g.:
 *
 * ```TypeScript
 * {
 *   "type": am4charts.XYChart,
 *   // ...
 * }
 * ```
 * ```JavaScript
 * {
 *   "type": am4charts.XYChart,
 *   // ...
 * }
 * ```
 *
 * Or via string: (if you are using JavaScript)
 *
 * ```TypeScript
 * {
 *   "type": "XYChart",
 *   // ...
 * }
 * ```
 * ```JavaScript
 * {
 *   "type": "XYChart",
 *   // ...
 * }
 * ```
 *
 * A `container` can either be a reference to an HTML container to put chart
 * in, or it's unique id.
 *
 * If `container` is not specified, it must be included in the config object:
 *
 * ```TypeScript
 * {
 *   "type": "XYChart",
 *   "container": "chartdiv",
 *   // ...
 * }
 * ```
 * ```JavaScript
 * {
 *   "type": "XYChart",
 *   "container": "chartdiv",
 *   // ...
 * }
 * ```
 *
 * @param  {any}                   config       Config object in property/value pairs
 * @param  {string | HTMLElement}  htmlElement  Container reference or ID
 * @param  {typeof Chart}          objectType   Chart type
 * @return {Chart}                              A newly created chart instance
 * @todo Throw exception if type is not correct
 */
export function createFromConfig(config, htmlElement, classType) {
    // Extract chart type from config if necessary
    if (!$type.hasValue(classType)) {
        classType = config.type;
        delete config.type;
    }
    // Extract element from config if necessary
    if (!$type.hasValue(htmlElement)) {
        htmlElement = config.container;
        delete config.container;
    }
    // Check if we need to extract actual type reference
    var finalType;
    var classError;
    if ($type.isString(classType) && $type.hasValue(registry.registeredClasses[classType])) {
        finalType = registry.registeredClasses[classType];
    }
    else if (typeof classType !== "function") {
        finalType = Container;
        classError = new Error("Class [" + classType + "] is not loaded.");
    }
    else {
        finalType = classType;
    }
    // Check if maybe we have `geodata` set as string, which would mean that
    // we need to try to refer to a loaded map with a global variable, like
    // `am4geodata_xxx`
    if ($type.hasValue(config["geodata"]) && $type.isString(config["geodata"])) {
        // Check if there's a map loaded by such name
        if ($type.hasValue(window["am4geodata_" + config["geodata"]])) {
            config["geodata"] = window["am4geodata_" + config["geodata"]];
        }
        // Nope. Let's try maybe we got JSON as string?
        else {
            try {
                config["geodata"] = JSON.parse(config["geodata"]);
            }
            catch (e) {
                // No go again. Error out.
                classError = new Error("<code>geodata</code> is incorrect or the map file is not loaded.");
            }
        }
    }
    // Create the chart
    var chart = createChild(htmlElement, finalType);
    // Set config
    if (classError) {
        chart.raiseCriticalError(classError);
    }
    else {
        chart.config = config;
    }
    return chart;
}
/**
 * Applies a theme to System, and subsequently all chart instances created
 * from that point forward.
 *
 * amCharts supports multiple themes. Calling `useTheme` multiple times will
 * make the System apply multiple themes, rather than overwrite previously
 * set one.
 *
 * This enables combining features from multiple themes on the same chart.
 * E.g.:
 *
 * ```TypeScript
 * am4core.useTheme(am4themes.material);
 * am4core.useTheme(am4themes.animated);
 * ```
 * ```JavaScript
 * am4core.useTheme(am4themes.material);
 * am4core.useTheme(am4themes.animated);
 * ```
 *
 * The above will apply both the Material color and animation options to all
 * charts created.
 *
 * @param {ITheme}  value  A reference to a theme
 */
export function useTheme(value) {
    registry.themes.push(value);
}
/**
 * Removes a theme from "active themes" list, so it won't get applied to any
 * charts created subsequently.
 *
 * @param {ITheme}  value  A reference to a theme
 */
export function unuseTheme(value) {
    $array.remove(registry.themes, value);
}
//# sourceMappingURL=Instance.js.map