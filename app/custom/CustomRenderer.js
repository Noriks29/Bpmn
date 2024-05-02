//https://github.com/bpmn-io/bpmn-js-example-custom-rendering

// Настройка отрисовки элемента
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate
} from 'tiny-svg';

import {
  getRoundRectPath
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { isNil } from 'min-dash';

const HIGH_PRIORITY = 1500,
      TASK_BORDER_RADIUS = 2,
      COLOR_GREEN = '#52B415',
      COLOR_BLUE = '#0000ff',
      COLOR_YELLOW = '#ffc800',
      COLOR_RED = '#cc0000',
      COLOR_BLACK = '#000000';


export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {

    // ignore labels
    return !element.labelTarget;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    //Задаются параметры отображения у элемента
    const suitabilityScore = this.getSuitabilityScore(element); // код SUITABILITY_SCORE_HIGH создаваемого элемента
    const GatewayMode = this.getGetwayMode(element); // код GatewayMode который нужно отобразить
    //const streamScore = 10;
    const streamScore = this.getStreamScore(element); // strem который нужно отобразить
    const volumeScore = this.getVolumeScore(element); // valume который нужно отобразить
    const penalty_start = this.getPenalty_start(element); // penalty_start который нужно отобразить
    const penalty_angle = this.getPenalty_angle(element); // valume который нужно отобразить

    if (suitabilityScore) {

      // const color = this.getColor(suitabilityScore);
      const color = COLOR_GREEN;
      const rect = drawRect(parentNode, 20, 20, TASK_BORDER_RADIUS, color);
      svgAttr(rect, {
        transform: 'translate(-10, -10)'
      });
      var text = svgCreate('text');
      svgAttr(text, {
        fill: '#fff',
        transform: 'translate(-7, 5)'
      });
      svgClasses(text).add('djs-label');
      svgAppend(text, document.createTextNode('✮'));
      svgAppend(parentNode, text);
    }
    if (GatewayMode) {

      // const color = this.getColor(suitabilityScore);
      const color = COLOR_BLACK;
      const rect = drawRect(parentNode, 30, 20, TASK_BORDER_RADIUS, color);
      svgAttr(rect, {
        transform: 'translate(-10, -10)'
      });
      var text = svgCreate('text');
      svgAttr(text, {
        fill: '#fff',
        transform: 'translate(-7, 5)'
      });
      svgClasses(text).add('djs-label');
      if(GatewayMode == "Diverging")
        svgAppend(text, document.createTextNode('out'));
      if(GatewayMode == "Converging")
        svgAppend(text, document.createTextNode('in'));
      svgAppend(parentNode, text);
    }

    // stream
    if (!isNil(streamScore)) {
      // const color = this.getColor(streamScore);
      const color = COLOR_RED;
      const rect2 = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, color);
      svgAttr(rect2, {
        transform: 'translate(6, 50)'
      });
      var text_stream = svgCreate('text');
      svgAttr(text_stream, {
        fill: '#fff',
        transform: 'translate(11, 65)'
      });
      svgClasses(text_stream).add('djs-label');
      svgAppend(text_stream, document.createTextNode('s:' + streamScore));
      svgAppend(parentNode, text_stream);
    }

    // volume
    if (!isNil(volumeScore)) {
      const color = COLOR_BLUE;
      const rect3 = drawRect(parentNode, 52, 20, TASK_BORDER_RADIUS, color);
      svgAttr(rect3, {
        transform: 'translate(63, 50)'
      });
      var text_volume = svgCreate('text');
      svgAttr(text_volume, {
        fill: '#fff',
        transform: 'translate(70, 65)'
      });
      svgClasses(text_volume).add('djs-label');
      svgAppend(text_volume, document.createTextNode('v:' + volumeScore));
      svgAppend(parentNode, text_volume);
    }

    // penalty_start
    if (!isNil(penalty_start)) {
      const color = COLOR_GREEN;
      const rect2 = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, color);
      svgAttr(rect2, {
        transform: 'translate(6, 75)'
      });
      var text_stream = svgCreate('text');
      svgAttr(text_stream, {
        fill: '#fff',
        transform: 'translate(11, 90)'
      });
      svgClasses(text_stream).add('djs-label');
      svgAppend(text_stream, document.createTextNode('Ps:' + penalty_start));
      svgAppend(parentNode, text_stream);
    }

    // penalty_angle
    if (!isNil(penalty_angle)) {
      const color = COLOR_YELLOW;
      const rect3 = drawRect(parentNode, 52, 20, TASK_BORDER_RADIUS, color);
      svgAttr(rect3, {
        transform: 'translate(63, 75)'
      });
      var text_volume = svgCreate('text');
      svgAttr(text_volume, {
        fill: '#fff',
        transform: 'translate(70, 90)'
      });
      svgClasses(text_volume).add('djs-label');
      svgAppend(text_volume, document.createTextNode('Pa:' + penalty_angle));
      svgAppend(parentNode, text_volume);
    }

    return shape;
  }

  getShapePath(shape) {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }

  getSuitabilityScore(element) {
    const businessObject = getBusinessObject(element);
    const suitabilityScore = businessObject.extensionElements?.get('values').find((val) => val.$type === 'qa:AnalysisDetails')?.suitabilityScore;
    return suitabilityScore;
  }

  getGetwayMode(element) {
    const businessObject = getBusinessObject(element);
    if(businessObject.$type == "bpmn:ExclusiveGateway" || 
        businessObject.$type == "bpmn:InclusiveGateway" ||
          businessObject.$type == "bpmn:ParallelGateway")
    {
      const gatewayDirection = businessObject.gatewayDirection;
      return gatewayDirection;
    }
    return null
      
  }

  

  getStreamScore(element) {
    const businessObject = getBusinessObject(element);
    const stream = businessObject.extensionElements?.get('values').find((val) => val.$type === 'ltsm:props')?.stream;
    return Number.isNaN(Number(stream)) ? null : Number(stream);
  }

  getVolumeScore(element) {
    const businessObject = getBusinessObject(element);
    const volume = businessObject.extensionElements?.get('values').find((val) => val.$type === 'ltsm:props')?.volume;
    return Number.isNaN(Number(volume)) ? null : Number(volume);
  }
  getPenalty_start(element) {
    const businessObject = getBusinessObject(element);
    const penalty_start = businessObject.extensionElements?.get('values').find((val) => val.$type === 'ltsm:props')?.penalty_start;
    return Number.isNaN(Number(penalty_start)) ? null : Number(penalty_start);
  }
  getPenalty_angle(element) {
    const businessObject = getBusinessObject(element);
    const penalty_angle = businessObject.extensionElements?.get('values').find((val) => val.$type === 'ltsm:props')?.penalty_angle;
    return Number.isNaN(Number(penalty_angle)) ? null : Number(penalty_angle);
  }
}

CustomRenderer.$inject = [ 'eventBus', 'bpmnRenderer' ];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, color) {
  const rect = svgCreate('rect');

  svgAttr(rect, {
    width: width,
    height: height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: color,
    strokeWidth: 2,
    fill: color
  });

  svgAppend(parentNode, rect);

  return rect;
}