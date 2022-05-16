import algebra from 'algebra.js';
import Expression = algebra.Expression;
import { Connector, Element } from '../model/types';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates one intersection point based on the source element (cf)
 * @param cf center of the source element
 * @param ct center of the target element
 * @param w element width
 * @param h element height
 * @param s slope
 */
const rectIntersectPoint = (
  cf: Point,
  ct: Point,
  w: number,
  h: number,
  s: number
): Point => {
  if (-h / 2 <= s * (w / 2) && s * (w / 2) <= h / 2) {
    // left intersect
    if (cf.x > ct.x) return { x: cf.x - w / 2, y: cf.y - s * (w / 2) };
    // right intersect
    if (cf.x < ct.x) return { x: cf.x + w / 2, y: cf.y + s * (w / 2) };
  }

  if (-w / 2 <= h / 2 / s && h / 2 / s <= w / 2) {
    // top intersect
    if (cf.y > ct.y) return { x: cf.x - h / 2 / s, y: cf.y - h / 2 };
    // bottom intersect
    if (cf.y < ct.y) return { x: cf.x + h / 2 / s, y: cf.y + h / 2 };
  }
  return { x: 0, y: 0 };
};

/**
 * Calculate the connector points for two circles
 * @param from source point
 * @param to target point
 * @param radius distance between the circle center point and the connector point
 */
const circleConnectorPoints = (
  from: Point,
  to: Point,
  radius: number
): number[] => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(-dy, dx);

  return [
    from.x - radius * Math.cos(angle + Math.PI),
    from.y + radius * Math.sin(angle + Math.PI),
    to.x - radius * Math.cos(angle),
    to.y + radius * Math.sin(angle),
  ];
};

/**
 * Calculate the connector points between two rectangles
 * @param from source point
 * @param to target point
 */
export const rectConnectorPoints = (from: Element, to: Element): number[] => {
  const cf = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const ct = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  const s = (cf.y - ct.y) / (cf.x - ct.x);

  const f = rectIntersectPoint(cf, ct, from.width, from.height, s);
  const t = rectIntersectPoint(ct, cf, to.width, to.height, s);

  return [f.x, f.y, t.x, t.y];
};

/**
 * Calculate the connector points between a task and an event (start-/ end-event)
 * @param event Element, representing the event
 * @param task Element, representing the task
 * @param direction The direction of the connector (e.g. event-task -> true, task-event -> false)
 */
export const eventConnectorPoints = (
  event: Element,
  task: Element,
  direction: boolean
): number[] => {
  const taskCenterPoint: Point = {
    x: task.x + task.width / 2,
    y: task.y + task.height / 2,
  };
  const eventCenterPoint: Point = { x: event.x, y: event.y };
  if (direction) {
    // Task connector point
    const slope = (event.y - taskCenterPoint.y) / (event.x - taskCenterPoint.x);
    const taskConnectorPoint = rectIntersectPoint(
      taskCenterPoint,
      eventCenterPoint,
      task.width,
      task.height,
      slope
    );
    // Start-event connector point
    const eventConnectorPoint = circleConnectorPoints(
      eventCenterPoint,
      taskCenterPoint,
      event.height / 3
    ).slice(0, 2);
    return eventConnectorPoint.concat([
      taskConnectorPoint.x,
      taskConnectorPoint.y,
    ]);
  }
  // Task connector point
  const slope = (taskCenterPoint.y - event.y) / (taskCenterPoint.x - event.x);
  const taskConnectorPoint = rectIntersectPoint(
    taskCenterPoint,
    eventCenterPoint,
    task.width,
    task.height,
    slope
  );
  // Start-event connector point
  const eventConnectorPoint = circleConnectorPoints(
    taskCenterPoint,
    eventCenterPoint,
    event.height / 3
  ).slice(2, 4);
  return [taskConnectorPoint.x, taskConnectorPoint.y].concat(
    eventConnectorPoint
  );
};

/**
 * Calculates the correct context menu position, when selecting a connector.
 * @param connector Connector
 */
export const connectorContextMenuPosition = (connector: Connector): Point => {
  const [x1, y1, x2, y2] = connector.points;
  // Compute the directional vector between the two connector points (p1, p2);
  const directionalVec = { x: x2 - x1, y: y2 - y1 };
  // Compute the normal vector of a line
  const normalVec = { x: -directionalVec.y, y: directionalVec.x };
  // The mid of the directional vector (anchor point for the normal vector)
  const midPoint = {
    x: x1 + 0.5 * directionalVec.x,
    y: y1 + 0.5 * directionalVec.y,
  };
  // Equation to calculate parameter t for the line equation.
  // Here a constant distance between the center of the line and the context menu position is specified.
  const eq = algebra.parse(
    `((${normalVec.x} * t)^2 + (${normalVec.y} * t)^2)^(0.5) = 20`
  );
  if (!(eq instanceof Expression)) {
    // Equation is solved
    const solveResult = eq.solveFor('t');
    if (typeof solveResult !== 'undefined') {
      const result = solveResult as number[];
      // If the connector points to the left, we need to use the negative value for t, so the context menu is
      // always below the arrow.
      const t = directionalVec.x < 0 ? result[0] : result[1];
      return {
        x: midPoint.x + t * 10 * normalVec.x,
        y: midPoint.y + t * 10 * normalVec.y,
      };
    }
  }
  return { x: 0, y: 0 };
};
