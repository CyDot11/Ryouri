import * as bp from "../../styles/breakpoints/breakpoints.module.scss";

let entries = Array.from(Object.entries(bp));
entries = entries.filter((entry) => entry[1] !== undefined);
const breakpoints = entries.map((entry) => [entry[0], parseInt(entry[1])]);
breakpoints.sort((a, b) => a[1] > b[1]);

export default breakpoints;
