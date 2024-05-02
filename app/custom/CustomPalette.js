
//Работа с палитрой

const SUITABILITY_SCORE_HIGH = 100,
      SUITABILITY_SCORE_AVERGE = 50,
      SUITABILITY_SCORE_LOW = 25;

export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      bpmnFactory,
      create,
      elementFactory,
      translate
    } = this;

    function createTask(suitabilityScore) {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:Task');

        businessObject.suitable = suitabilityScore;

        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject: businessObject
        });

        create.start(event, shape);
      };
    }
    function createExclusiveGateway(typeBPMN) {
      return function(event) {
        const businessObject = bpmnFactory.create(typeBPMN);

        businessObject.gatewayDirection = "Diverging"

        const shape = elementFactory.createShape({
          type: typeBPMN,
          businessObject: businessObject
        });

        create.start(event, shape);
      };
    }
    //bpmn:ExclusiveGateway
    return {
      'create.parallelGateway': {
        group: 'activity',
        className: 'bpmn-icon-gateway-parallel',
        title: translate('Create Parallel Gateway'),
        action: {
          dragstart: createExclusiveGateway("bpmn:ParallelGateway"),
          click: createExclusiveGateway("bpmn:ParallelGateway")
        }
      },
      'create.xorGateway': {
        group: 'activity',
        className: 'bpmn-icon-gateway-xor',
        title: translate('Create Exclusive Gateway'),
        action: {
          dragstart: createExclusiveGateway("bpmn:ExclusiveGateway"),
          click: createExclusiveGateway("bpmn:ExclusiveGateway")
        }
      },
      'create.orexclusiveGateway': {
        group: 'activity',
        className: 'bpmn-icon-gateway-or',
        title: translate('Create Inclusive Gateway'),
        action: {
          dragstart: createExclusiveGateway("bpmn:InclusiveGateway"),
          click: createExclusiveGateway("bpmn:InclusiveGateway")
        }
      }
      /*
              className: 'bpmn-icon-gateway-eventbased',
              className: 'bpmn-icon-gateway-complex',
      'create.average-task': {
        group: 'activity',
        className: 'bpmn-icon-task yellow',
        title: translate('Create Task with average suitability score'),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_AVERGE),
          click: createTask(SUITABILITY_SCORE_AVERGE)
        }
      }*/
    };
  }
}

CustomPalette.$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate'
];